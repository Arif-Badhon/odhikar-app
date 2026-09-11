"use server";

async function staffContext(token: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const auth = await supabaseAdmin.auth.getUser(token);
  if (auth.error || !auth.data.user) throw new Error("Staff authentication required");
  const role = await supabaseAdmin.from("user_roles").select("role").eq("user_id", auth.data.user.id).limit(1).maybeSingle();
  if (!role.data) throw new Error("Active staff access required");
  return { supabaseAdmin, user: auth.data.user };
}

async function aiJson(system: string, content: string) {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("Simulation AI is temporarily unavailable.");
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", { method:"POST", headers:{"Content-Type":"application/json",Authorization:`Bearer ${key}`}, body:JSON.stringify({model:"google/gemini-3.8-flash",response_format:{type:"json_object"},messages:[{role:"system",content:system},{role:"user",content}]}) });
  if (!response.ok) throw new Error("Simulation AI is temporarily unavailable.");
  const json=await response.json() as {choices?:{message?:{content?:string}}[]};
  return JSON.parse(json.choices?.[0]?.message?.content ?? "{}") as Record<string,unknown>;
}

export const startTraining = async ({ data: x }: { data: { token:string;scenarioId:string } }) => {
  const data = x;
  const {supabaseAdmin,user}=await staffContext(data.token);
  const scenario=await supabaseAdmin.from("training_scenarios").select("id,title_bn,title_en,persona_name,difficulty,public_brief,competency_focus").eq("id",data.scenarioId).single();
  if(scenario.error) throw new Error("Training scenario not found");
  const session=await supabaseAdmin.from("training_sessions").insert({scenario_id:data.scenarioId,staff_id:user.id}).select("id,started_at").single();
  if(session.error) throw new Error("Training session could not start");
  return {session:session.data,scenario:scenario.data};
};

export const trainingReply = async ({ data: x }: { data: { token:string;sessionId:string;message:string } }) => {
  const data = {...x,message:String(x.message).slice(0,1200)};
  const {supabaseAdmin,user}=await staffContext(data.token);
  const session=await supabaseAdmin.from("training_sessions").select("id,scenario_id,turn_count").eq("id",data.sessionId).eq("staff_id",user.id).single();
  if(session.error) throw new Error("Training session not found");
  const scenario=await supabaseAdmin.from("training_scenarios").select("persona_name,hidden_ground_truth,public_brief").eq("id",session.data.scenario_id).single();
  if (scenario.error || !scenario.data) throw new Error("Training scenario not found");
  const previous=await supabaseAdmin.from("training_messages").select("role,content").eq("session_id",data.sessionId).order("turn_number");
  const turn=session.data.turn_count+1;
  const result=await aiJson("Act only as the synthetic Bangladeshi client described in hidden facts. Answer in natural Bangla, briefly and emotionally consistently. Reveal only facts directly invited by the trainee's latest question. Never coach, score, provide legal advice, or mention hidden facts. Return JSON {reply:string}.",JSON.stringify({brief:scenario.data.public_brief,persona:scenario.data.persona_name,hiddenFacts:scenario.data.hidden_ground_truth,conversation:previous.data,trainee:data.message}));
  const reply=String(result["reply"]||"প্রশ্নটি আরেকটু সহজ করে বলবেন?");
  await supabaseAdmin.from("training_messages").insert([{session_id:data.sessionId,role:"trainee",content:data.message,turn_number:turn*2-1},{session_id:data.sessionId,role:"client",content:reply,turn_number:turn*2}]);
  await supabaseAdmin.from("training_sessions").update({turn_count:turn}).eq("id",data.sessionId);
  return {reply,turn};
};

export const completeTraining = async ({ data: x }: { data: { token:string;sessionId:string } }) => {
  const data = x;
  const {supabaseAdmin,user}=await staffContext(data.token);
  const session=await supabaseAdmin.from("training_sessions").select("id,scenario_id,started_at").eq("id",data.sessionId).eq("staff_id",user.id).single();
  if(session.error) throw new Error("Training session not found");
  const [scenario,messages]=await Promise.all([supabaseAdmin.from("training_scenarios").select("hidden_ground_truth,competency_focus").eq("id",session.data.scenario_id).single(),supabaseAdmin.from("training_messages").select("role,content").eq("session_id",data.sessionId).order("turn_number")]);
  if (scenario.error || !scenario.data) throw new Error("Training scenario not found");
  const rubric=await aiJson("Score this synthetic paralegal interview. Safety is critical: penalize missed urgent clues. Do not give legal advice. Return JSON: totalScore 0-100; competencyScores object with rapport,openQuestions,chronology,safety,evidence,documentation each 0-100; strengths string[]; missedInformation string[]; missedSafetyQuestions string[]; missedEvidenceQuestions string[]; leadingOrRepetitiveQuestions string[]; elicitedFacts string[]; checklist string[]; suggestedFollowUps string[]; summary string.",JSON.stringify({groundTruth:scenario.data.hidden_ground_truth,focus:scenario.data.competency_focus,conversation:messages.data}));
  const score={total_score:Number(rubric["totalScore"])||0,competency_scores:(rubric["competencyScores"]??{}) as object,strengths:(rubric["strengths"]??[]) as object,missed_information:(rubric["missedInformation"]??[]) as object,missed_safety_questions:(rubric["missedSafetyQuestions"]??[]) as object,missed_evidence_questions:(rubric["missedEvidenceQuestions"]??[]) as object,leading_or_repetitive_questions:(rubric["leadingOrRepetitiveQuestions"]??[]) as object,elicited_facts:(rubric["elicitedFacts"]??[]) as object,effective_interview_checklist:(rubric["checklist"]??[]) as object,suggested_follow_ups:(rubric["suggestedFollowUps"]??[]) as object,session_summary:String(rubric["summary"]??"Review completed."),session_id:data.sessionId};
  await supabaseAdmin.from("training_scores").insert(score as never);
  await supabaseAdmin.from("training_sessions").update({status:"completed",completed_at:new Date().toISOString()}).eq("id",data.sessionId);
  return score;
};

export const trainingHistory = async ({ data: x }: { data: { token:string } }) => {
  const data = x;
  const {supabaseAdmin,user}=await staffContext(data.token);
  const rows=await supabaseAdmin.from("training_sessions").select("id,scenario_id,status,started_at,completed_at,turn_count,training_scores(total_score,session_summary)").eq("staff_id",user.id).order("started_at",{ascending:false});
  return rows.data??[];
};