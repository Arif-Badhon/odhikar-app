CREATE TYPE public.app_role AS ENUM ('paralegal', 'coordinator', 'admin');
CREATE TYPE public.case_status AS ENUM ('New', 'Assigned', 'Booked', 'Closed');
CREATE TYPE public.case_urgency AS ENUM ('Urgent', 'Time-sensitive', 'Normal');
CREATE TYPE public.training_status AS ENUM ('in_progress', 'completed', 'abandoned');

CREATE TABLE public.staff_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  display_name text NOT NULL,
  clinic_name text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.staff_profiles TO authenticated;
GRANT ALL ON public.staff_profiles TO service_role;
ALTER TABLE public.staff_profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.is_active_staff(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.staff_profiles sp ON sp.id = ur.user_id
    WHERE ur.user_id = _user_id AND sp.active = true
  )
$$;
GRANT EXECUTE ON FUNCTION public.is_active_staff(uuid) TO authenticated, service_role;

CREATE POLICY "Staff can read own profile" ON public.staff_profiles
FOR SELECT TO authenticated USING (id = auth.uid() AND active = true);
CREATE POLICY "Staff can update own profile" ON public.staff_profiles
FOR UPDATE TO authenticated USING (id = auth.uid() AND active = true) WITH CHECK (id = auth.uid());
CREATE POLICY "Staff can read own roles" ON public.user_roles
FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE TABLE public.cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_number text UNIQUE NOT NULL,
  case_kind text NOT NULL DEFAULT 'victim' CHECK (case_kind = 'victim'),
  status public.case_status NOT NULL DEFAULT 'New',
  urgency public.case_urgency NOT NULL DEFAULT 'Normal',
  primary_category text NOT NULL,
  secondary_category text,
  confidence numeric(4,3) NOT NULL DEFAULT 0.5 CHECK (confidence >= 0 AND confidence <= 1),
  safety_flag boolean NOT NULL DEFAULT false,
  safety_note text,
  transcript_bn text NOT NULL,
  transcript_source text,
  audio_path text,
  audio_duration_seconds integer NOT NULL DEFAULT 0,
  assigned_to uuid,
  received_at timestamptz NOT NULL DEFAULT now(),
  structured_record jsonb NOT NULL DEFAULT '{}'::jsonb,
  missing_fields jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cases TO authenticated;
GRANT ALL ON public.cases TO service_role;
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active staff can read victim cases" ON public.cases
FOR SELECT TO authenticated USING (public.is_active_staff(auth.uid()));
CREATE POLICY "Active staff can update victim cases" ON public.cases
FOR UPDATE TO authenticated USING (public.is_active_staff(auth.uid())) WITH CHECK (public.is_active_staff(auth.uid()) AND case_kind = 'victim');

CREATE TABLE public.case_parties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  party_role text NOT NULL CHECK (party_role IN ('applicant', 'respondent')),
  name text,
  relationship text,
  detail text,
  provenance jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.case_parties TO authenticated;
GRANT ALL ON public.case_parties TO service_role;
ALTER TABLE public.case_parties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active staff manage case parties" ON public.case_parties FOR ALL TO authenticated
USING (public.is_active_staff(auth.uid())) WITH CHECK (public.is_active_staff(auth.uid()));

CREATE TABLE public.case_evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  item text NOT NULL,
  location text,
  provenance jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.case_evidence TO authenticated;
GRANT ALL ON public.case_evidence TO service_role;
ALTER TABLE public.case_evidence ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active staff manage case evidence" ON public.case_evidence FOR ALL TO authenticated
USING (public.is_active_staff(auth.uid())) WITH CHECK (public.is_active_staff(auth.uid()));

CREATE TABLE public.case_follow_up_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  field_key text NOT NULL,
  answer text NOT NULL,
  answered_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (case_id, field_key)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.case_follow_up_answers TO authenticated;
GRANT ALL ON public.case_follow_up_answers TO service_role;
ALTER TABLE public.case_follow_up_answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active staff manage follow up answers" ON public.case_follow_up_answers FOR ALL TO authenticated
USING (public.is_active_staff(auth.uid())) WITH CHECK (public.is_active_staff(auth.uid()));

CREATE TABLE public.appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid UNIQUE NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  clinic_id text NOT NULL,
  clinic_name text NOT NULL,
  slot_id text NOT NULL,
  appointment_label text NOT NULL,
  scheduled_at timestamptz,
  status text NOT NULL DEFAULT 'booked',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.appointments TO authenticated;
GRANT ALL ON public.appointments TO service_role;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active staff manage appointments" ON public.appointments FOR ALL TO authenticated
USING (public.is_active_staff(auth.uid())) WITH CHECK (public.is_active_staff(auth.uid()));

CREATE TABLE public.complaint_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid UNIQUE NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  template_key text NOT NULL,
  draft_text text NOT NULL,
  review_state text NOT NULL DEFAULT 'draft' CHECK (review_state IN ('draft', 'editing', 'approved')),
  approved_by uuid,
  approved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.complaint_drafts TO authenticated;
GRANT ALL ON public.complaint_drafts TO service_role;
ALTER TABLE public.complaint_drafts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active staff manage complaint drafts" ON public.complaint_drafts FOR ALL TO authenticated
USING (public.is_active_staff(auth.uid())) WITH CHECK (public.is_active_staff(auth.uid()));

CREATE TABLE public.knowledge_categories (
  id text PRIMARY KEY,
  slug text UNIQUE NOT NULL,
  name_bn text NOT NULL,
  name_en text NOT NULL,
  description_bn text NOT NULL,
  icon text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.knowledge_categories TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.knowledge_categories TO authenticated;
GRANT ALL ON public.knowledge_categories TO service_role;
ALTER TABLE public.knowledge_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read knowledge categories" ON public.knowledge_categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Active staff manage knowledge categories" ON public.knowledge_categories FOR ALL TO authenticated
USING (public.is_active_staff(auth.uid())) WITH CHECK (public.is_active_staff(auth.uid()));

CREATE TABLE public.knowledge_articles (
  id text PRIMARY KEY,
  slug text UNIQUE NOT NULL,
  category_id text NOT NULL REFERENCES public.knowledge_categories(id),
  title_bn text NOT NULL,
  title_en text NOT NULL,
  summary_bn text NOT NULL,
  sections jsonb NOT NULL DEFAULT '[]'::jsonb,
  tags text[] NOT NULL DEFAULT '{}',
  reviewed_status text NOT NULL DEFAULT 'verification_required' CHECK (reviewed_status IN ('reviewed', 'template_reviewed', 'verification_required', 'draft')),
  reviewed_on date,
  related_slugs text[] NOT NULL DEFAULT '{}',
  help_contacts jsonb NOT NULL DEFAULT '[]'::jsonb,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.knowledge_articles TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.knowledge_articles TO authenticated;
GRANT ALL ON public.knowledge_articles TO service_role;
ALTER TABLE public.knowledge_articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read published knowledge" ON public.knowledge_articles FOR SELECT TO anon, authenticated USING (published = true);
CREATE POLICY "Active staff manage knowledge articles" ON public.knowledge_articles FOR ALL TO authenticated
USING (public.is_active_staff(auth.uid())) WITH CHECK (public.is_active_staff(auth.uid()));

CREATE TABLE public.knowledge_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_title_bn text NOT NULL,
  source_title_en text,
  source_type text NOT NULL CHECK (source_type IN ('Act', 'Rules', 'Regulation', 'Government guidance', 'Official service', 'Other')),
  issuing_authority text,
  act_year integer,
  publication_date date,
  section_or_rule text,
  official_url text,
  reviewed_status text NOT NULL DEFAULT 'verification_required',
  reviewed_on date,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.knowledge_sources TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.knowledge_sources TO authenticated;
GRANT ALL ON public.knowledge_sources TO service_role;
ALTER TABLE public.knowledge_sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read knowledge sources" ON public.knowledge_sources FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Active staff manage knowledge sources" ON public.knowledge_sources FOR ALL TO authenticated
USING (public.is_active_staff(auth.uid())) WITH CHECK (public.is_active_staff(auth.uid()));

CREATE TABLE public.knowledge_article_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id text NOT NULL REFERENCES public.knowledge_articles(id) ON DELETE CASCADE,
  source_id uuid NOT NULL REFERENCES public.knowledge_sources(id) ON DELETE CASCADE,
  section_kind text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (article_id, source_id, section_kind)
);
GRANT SELECT ON public.knowledge_article_sources TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.knowledge_article_sources TO authenticated;
GRANT ALL ON public.knowledge_article_sources TO service_role;
ALTER TABLE public.knowledge_article_sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read article source mapping" ON public.knowledge_article_sources FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Active staff manage article sources" ON public.knowledge_article_sources FOR ALL TO authenticated
USING (public.is_active_staff(auth.uid())) WITH CHECK (public.is_active_staff(auth.uid()));

CREATE TABLE public.training_scenarios (
  id text PRIMARY KEY,
  title_bn text NOT NULL,
  title_en text NOT NULL,
  persona_name text NOT NULL,
  age integer,
  gender text,
  district text NOT NULL,
  legal_category text NOT NULL,
  difficulty text NOT NULL CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
  competency_focus text[] NOT NULL DEFAULT '{}',
  public_brief text NOT NULL,
  hidden_ground_truth jsonb NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.training_scenarios TO authenticated;
GRANT ALL ON public.training_scenarios TO service_role;
ALTER TABLE public.training_scenarios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active staff can read training catalog" ON public.training_scenarios FOR SELECT TO authenticated USING (public.is_active_staff(auth.uid()));

CREATE TABLE public.training_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_id text NOT NULL REFERENCES public.training_scenarios(id),
  staff_id uuid NOT NULL,
  status public.training_status NOT NULL DEFAULT 'in_progress',
  turn_count integer NOT NULL DEFAULT 0,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  duration_seconds integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.training_sessions TO authenticated;
GRANT ALL ON public.training_sessions TO service_role;
ALTER TABLE public.training_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff manage own training sessions" ON public.training_sessions FOR ALL TO authenticated
USING (staff_id = auth.uid() AND public.is_active_staff(auth.uid())) WITH CHECK (staff_id = auth.uid() AND public.is_active_staff(auth.uid()));

CREATE TABLE public.training_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.training_sessions(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('trainee', 'client')),
  content text NOT NULL,
  turn_number integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.training_messages TO authenticated;
GRANT ALL ON public.training_messages TO service_role;
ALTER TABLE public.training_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff manage own training messages" ON public.training_messages FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.training_sessions s WHERE s.id = session_id AND s.staff_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.training_sessions s WHERE s.id = session_id AND s.staff_id = auth.uid()));

CREATE TABLE public.training_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid UNIQUE NOT NULL REFERENCES public.training_sessions(id) ON DELETE CASCADE,
  total_score integer NOT NULL CHECK (total_score BETWEEN 0 AND 100),
  competency_scores jsonb NOT NULL,
  strengths jsonb NOT NULL DEFAULT '[]'::jsonb,
  missed_information jsonb NOT NULL DEFAULT '[]'::jsonb,
  missed_safety_questions jsonb NOT NULL DEFAULT '[]'::jsonb,
  missed_evidence_questions jsonb NOT NULL DEFAULT '[]'::jsonb,
  leading_or_repetitive_questions jsonb NOT NULL DEFAULT '[]'::jsonb,
  elicited_facts jsonb NOT NULL DEFAULT '[]'::jsonb,
  effective_interview_checklist jsonb NOT NULL DEFAULT '[]'::jsonb,
  suggested_follow_ups jsonb NOT NULL DEFAULT '[]'::jsonb,
  documentation_completeness text,
  session_summary text,
  legal_process_source_note text NOT NULL DEFAULT 'Prototype feedback; legal and SME validation required.',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.training_scores TO authenticated;
GRANT ALL ON public.training_scores TO service_role;
ALTER TABLE public.training_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff read own training scores" ON public.training_scores FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.training_sessions s WHERE s.id = session_id AND s.staff_id = auth.uid()));

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

CREATE TRIGGER staff_profiles_updated_at BEFORE UPDATE ON public.staff_profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER cases_updated_at BEFORE UPDATE ON public.cases FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER case_parties_updated_at BEFORE UPDATE ON public.case_parties FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER case_evidence_updated_at BEFORE UPDATE ON public.case_evidence FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER appointments_updated_at BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER complaint_drafts_updated_at BEFORE UPDATE ON public.complaint_drafts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER knowledge_categories_updated_at BEFORE UPDATE ON public.knowledge_categories FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER knowledge_articles_updated_at BEFORE UPDATE ON public.knowledge_articles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER knowledge_sources_updated_at BEFORE UPDATE ON public.knowledge_sources FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER training_scenarios_updated_at BEFORE UPDATE ON public.training_scenarios FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER training_sessions_updated_at BEFORE UPDATE ON public.training_sessions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.staff_profiles (id, email, display_name, clinic_name) VALUES
('10000000-0000-4000-8000-000000000001', 'nasrin@odhikar.demo', 'Nasrin Akter', 'Manikganj Legal Aid Clinic'),
('10000000-0000-4000-8000-000000000002', 'coordinator@odhikar.demo', 'Shahin Rahman', 'Odhikar Coordination Desk');
INSERT INTO public.user_roles (user_id, role) VALUES
('10000000-0000-4000-8000-000000000001', 'paralegal'),
('10000000-0000-4000-8000-000000000002', 'coordinator');

INSERT INTO public.training_scenarios (id, title_bn, title_en, persona_name, age, gender, district, legal_category, difficulty, competency_focus, public_brief, hidden_ground_truth) VALUES
('train-dower', 'দেনমোহর ও ভরণপোষণ', 'Dower and maintenance', 'শারমিন আক্তার', 29, 'Woman', 'Manikganj', 'Dower & Maintenance', 'Beginner', ARRAY['rapport','chronology','documents'], 'A separated client needs help organizing a dower and maintenance intake.', '{"background":"Separated after six years of marriage; one child","parties":["husband Kamal Hossain"],"timeline":["married 2020","separated three months ago"],"amounts":{"dower":150000,"paid":20000},"dependants":"one daughter, age 4","evidence":["kabinnama with elder sister","mobile payment records"],"previousActions":"family meeting","safety":{"urgent":false},"progressiveFacts":["child disclosed when asked about dependants","payment amount disclosed when asked what was already paid"]}'::jsonb),
('train-dowry', 'অসম্পূর্ণ প্রমাণসহ যৌতুকের চাপ', 'Dowry pressure with incomplete evidence', 'মৌসুমী রহমান', 24, 'Woman', 'Gazipur', 'Dowry', 'Intermediate', ARRAY['evidence','non-leading','safety'], 'A client reports repeated money demands but is unsure what evidence matters.', '{"background":"Married eight months","parties":["husband","mother-in-law"],"amounts":{"dowryPaid":70000},"evidence":["two deleted messages may be recoverable","father witnessed payment"],"safety":{"urgent":false,"clue":"threatened with being sent away"},"progressiveFacts":["father as witness only if asked who saw payment","threat only if asked about pressure or safety"]}'::jsonb),
('train-safety', 'নিরাপত্তা প্রকাশসহ পারিবারিক সহিংসতা', 'Domestic violence safety disclosure', 'রুবিনা ইয়াসমিন', 32, 'Woman', 'Dhaka', 'Dower & Maintenance', 'Advanced', ARRAY['safety','escalation','client-centered'], 'A distressed client initially asks only about maintenance.', '{"background":"Living with spouse and two children","claimedHarm":"recent assault and threat","safety":{"urgent":true,"facts":["injured yesterday","threatened with knife","children present"]},"evidence":["clinic prescription in handbag"],"progressiveFacts":["assault only after an open safety question","knife threat only after asking whether safe to return home"]}'::jsonb),
('train-wages', 'বকেয়া মজুরি', 'Unpaid wages', 'মোঃ জসিম উদ্দিন', 38, 'Man', 'Narayanganj', 'Unpaid Wages', 'Beginner', ARRAY['amounts','chronology','evidence'], 'A construction worker has not received the final part of his wages.', '{"background":"Mason on a 18-day job","amounts":{"dailyRate":900,"paid":8000,"total":16200,"outstanding":8200},"evidence":["site photos","two coworkers"],"previousActions":"called contractor three times","safety":{"urgent":false}}'::jsonb),
('train-collective', 'দলগত মজুরি বিরোধ', 'Collective wage issue', 'রহিমা বেগম', 41, 'Woman', 'Savar', 'Unpaid Wages', 'Advanced', ARRAY['parties','documentation','scope'], 'A worker speaks for several colleagues in a factory wage dispute.', '{"background":"Seven workers affected","amounts":{"months":2},"parties":["factory supervisor","employer company"],"evidence":["attendance cards","group chat"],"materialMissing":["authority to speak for colleagues","individual wage amounts"],"safety":{"urgent":false}}'::jsonb),
('train-land', 'জমি ও উত্তরাধিকার বিরোধ', 'Land and inheritance conflict', 'সালমা খাতুন', 46, 'Woman', 'Rangpur', 'Land Dispute', 'Intermediate', ARRAY['documents','parties','urgency'], 'A client believes siblings may sell inherited land.', '{"background":"Father died 2023","parties":["two brothers"],"land":{"area":"38 decimals","saleRisk":true},"evidence":["death certificate","old khatian with brother"],"materialMissing":["dag number","mutation status"],"safety":{"urgent":false}}'::jsonb),
('train-ambiguous', 'অল্প তথ্যের প্রাথমিক সাক্ষাৎকার', 'Ambiguous low-information intake', 'করিম আলী', 35, 'Man', 'Cumilla', 'Out of scope', 'Advanced', ARRAY['open-questions','issue-spotting','relevance'], 'A client begins with only: “They are not giving me what is mine.”', '{"background":"Consumer purchase dispute, outside current supported scope","materialMissing":["who","what item","transaction date","amount"],"safety":{"urgent":false},"progressiveFacts":["consumer dispute only emerges through neutral open questions"]}'::jsonb),
('train-outscope', 'সেবার আওতার বাইরের বিষয়', 'Out-of-scope issue', 'নাবিলা ইসলাম', 27, 'Woman', 'Rajshahi', 'Out of scope', 'Intermediate', ARRAY['scope','process','ethics'], 'A client needs identity-document correction, not representation in a supported case category.', '{"background":"Birth registration spelling mismatch","evidence":["school certificate","parents NID"],"expectedProcess":"explain scope and direct to official service/general legal aid without inventing a remedy","safety":{"urgent":false}}'::jsonb);

INSERT INTO public.cases (case_number, status, urgency, primary_category, secondary_category, confidence, safety_flag, safety_note, transcript_bn, transcript_source, structured_record, missing_fields, received_at) VALUES
('ODH-2026-0419', 'New', 'Urgent', 'Dower & Maintenance', NULL, 0.94, true, 'Recent assault and threat disclosed; automated intake stopped.', 'গত সপ্তাহে আমার স্বামী আমাকে মারধর করেছে এবং কাল রাতে আবার হুমকি দিয়েছে।', 'fixture', '{"id":"ODH-2026-0419","createdAt":"2026-09-11T07:48:00Z","receivedLabel":"12 min ago","status":"New","urgency":"Urgent","classification":{"primary":"Dower & Maintenance","confidence":0.94,"rationale":"Dower issue with immediate safety disclosure."},"applicants":[{"id":"ap1","role":"applicant","name":{"provenance":"unknown"},"relationship":{"value":"Wife","provenance":"explicit"}}],"respondents":[{"id":"rp1","role":"respondent","name":{"provenance":"unknown"},"relationship":{"value":"Husband","provenance":"explicit"}}],"keyDates":[],"amounts":{"dower":{"value":150000,"provenance":"explicit"}},"timeline":[],"claimedHarm":{"value":"Recent assault and threat","provenance":"explicit"},"currentSituation":{"value":"Immediate safety concern","provenance":"explicit"},"dependants":{"provenance":"unknown"},"evidence":[],"previousActions":{"provenance":"unknown"},"safetyFlag":true,"safetyNote":"Recent assault and threat disclosed; automated intake stopped.","missing":["Applicant name","Safe contact route"],"transcriptBn":"গত সপ্তাহে আমার স্বামী আমাকে মারধর করেছে এবং কাল রাতে আবার হুমকি দিয়েছে।","audioRef":"","audioDurationSec":0,"transcriptSource":"fixture","draftApproved":false}'::jsonb, '["Applicant name","Safe contact route"]'::jsonb, now() - interval '12 minutes'),
('ODH-2026-0417', 'New', 'Normal', 'Dowry', 'Dower & Maintenance', 0.91, false, NULL, 'বিয়ের পর স্বামী ও শাশুড়ি টাকা চেয়েছে। বাবা আশি হাজার টাকা দিয়েছেন। কাবিননামায় দেনমোহর এক লাখ বিশ হাজার টাকা।', 'fixture', '{"id":"ODH-2026-0417","createdAt":"2026-09-11T06:48:00Z","receivedLabel":"1 hr ago","status":"New","urgency":"Normal","classification":{"primary":"Dowry","secondary":"Dower & Maintenance","confidence":0.91,"rationale":"Dowry demand and unpaid dower."},"applicants":[{"id":"ap1","role":"applicant","name":{"provenance":"unknown"},"relationship":{"value":"Wife","provenance":"explicit"}}],"respondents":[{"id":"rp1","role":"respondent","name":{"provenance":"unknown"},"relationship":{"value":"Husband","provenance":"explicit"}}],"keyDates":[],"amounts":{"dower":{"value":120000,"provenance":"explicit"},"dowryPaid":{"value":80000,"provenance":"explicit"}},"timeline":[],"claimedHarm":{"value":"Repeated dowry demands","provenance":"explicit"},"currentSituation":{"value":"Asked to leave marital home","provenance":"explicit"},"dependants":{"provenance":"unknown"},"evidence":[{"id":"e1","item":{"value":"Kabinnama","provenance":"explicit"},"location":{"value":"With father","provenance":"explicit"}}],"previousActions":{"provenance":"unknown"},"safetyFlag":false,"missing":["Applicant name","Respondent name"],"transcriptBn":"বিয়ের পর স্বামী ও শাশুড়ি টাকা চেয়েছে। বাবা আশি হাজার টাকা দিয়েছেন। কাবিননামায় দেনমোহর এক লাখ বিশ হাজার টাকা।","audioRef":"","audioDurationSec":0,"transcriptSource":"fixture","draftApproved":false}'::jsonb, '["Applicant name","Respondent name"]'::jsonb, now() - interval '1 hour'),
('ODH-2026-0416', 'New', 'Normal', 'Unpaid Wages', NULL, 0.90, false, NULL, 'আমি দশ দিন কাজ করেছি, দিনে ৫৫০ টাকা। তিন হাজার টাকা পেয়েছি, বাকিটা দেয়নি।', 'fixture', '{"id":"ODH-2026-0416","createdAt":"2026-09-11T04:48:00Z","receivedLabel":"3 hrs ago","status":"New","urgency":"Normal","classification":{"primary":"Unpaid Wages","confidence":0.9,"rationale":"Stated work duration, rate and partial payment."},"applicants":[{"id":"ap1","role":"applicant","name":{"provenance":"unknown"},"relationship":{"value":"Worker","provenance":"explicit"}}],"respondents":[{"id":"rp1","role":"respondent","name":{"value":"Rafiq Mia","provenance":"explicit"},"relationship":{"value":"Employer","provenance":"explicit"}}],"keyDates":[],"amounts":{"wagesTotal":{"value":5500,"provenance":"calculated"},"wagesPaid":{"value":3000,"provenance":"explicit"},"outstanding":{"value":2500,"provenance":"calculated"}},"timeline":[],"claimedHarm":{"value":"Unpaid wages","provenance":"explicit"},"currentSituation":{"value":"Payment withheld","provenance":"explicit"},"dependants":{"provenance":"unknown"},"evidence":[{"id":"e1","item":{"value":"Two coworkers","provenance":"explicit"},"location":{"provenance":"unknown"}}],"previousActions":{"provenance":"unknown"},"safetyFlag":false,"missing":["Applicant name","Work dates"],"transcriptBn":"আমি দশ দিন কাজ করেছি, দিনে ৫৫০ টাকা। তিন হাজার টাকা পেয়েছি, বাকিটা দেয়নি।","audioRef":"","audioDurationSec":0,"transcriptSource":"fixture","draftApproved":false}'::jsonb, '["Applicant name","Work dates"]'::jsonb, now() - interval '3 hours'),
('ODH-2026-0411', 'Assigned', 'Time-sensitive', 'Land Dispute', NULL, 0.88, false, NULL, 'বাবা মারা যাওয়ার পর ভাইয়েরা জমি ভাগ করে নিয়েছে, এখন বিক্রির চেষ্টা করছে।', 'fixture', '{"id":"ODH-2026-0411","createdAt":"2026-09-10T08:00:00Z","receivedLabel":"Yesterday","status":"Assigned","urgency":"Time-sensitive","classification":{"primary":"Land Dispute","confidence":0.88,"rationale":"Inheritance share withheld and possible sale."},"applicants":[{"id":"ap1","role":"applicant","name":{"provenance":"unknown"},"relationship":{"value":"Daughter of deceased","provenance":"explicit"}}],"respondents":[{"id":"rp1","role":"respondent","name":{"provenance":"unknown"},"relationship":{"value":"Brother","provenance":"explicit"}}],"keyDates":[],"amounts":{},"timeline":[],"claimedHarm":{"value":"Denied inheritance share","provenance":"explicit"},"currentSituation":{"value":"Possible sale in progress","provenance":"explicit"},"dependants":{"provenance":"unknown"},"evidence":[{"id":"e1","item":{"value":"Deed and khatian","provenance":"explicit"},"location":{"value":"With elder brother","provenance":"explicit"}}],"previousActions":{"provenance":"unknown"},"safetyFlag":false,"missing":["Applicant name","Dag number","Mutation status"],"transcriptBn":"বাবা মারা যাওয়ার পর ভাইয়েরা জমি ভাগ করে নিয়েছে, এখন বিক্রির চেষ্টা করছে।","audioRef":"","audioDurationSec":0,"transcriptSource":"fixture","draftApproved":false}'::jsonb, '["Applicant name","Dag number","Mutation status"]'::jsonb, now() - interval '1 day'),
('ODH-2026-0409', 'Booked', 'Normal', 'Dower & Maintenance', NULL, 0.86, false, NULL, 'আলাদা থাকার পর থেকে দেনমোহর ও ভরণপোষণ পাইনি।', 'fixture', '{"id":"ODH-2026-0409","createdAt":"2026-09-10T07:00:00Z","receivedLabel":"Yesterday","status":"Booked","urgency":"Normal","classification":{"primary":"Dower & Maintenance","confidence":0.86,"rationale":"Unpaid dower after separation."},"applicants":[{"id":"ap1","role":"applicant","name":{"value":"Farzana Begum","provenance":"explicit"},"relationship":{"value":"Wife","provenance":"explicit"}}],"respondents":[{"id":"rp1","role":"respondent","name":{"provenance":"unknown"},"relationship":{"value":"Husband","provenance":"explicit"}}],"keyDates":[],"amounts":{},"timeline":[],"claimedHarm":{"value":"Dower and maintenance unpaid","provenance":"explicit"},"currentSituation":{"value":"Living separately","provenance":"explicit"},"dependants":{"value":"One child","provenance":"explicit"},"evidence":[],"previousActions":{"provenance":"unknown"},"safetyFlag":false,"missing":["Respondent name"],"transcriptBn":"আলাদা থাকার পর থেকে দেনমোহর ও ভরণপোষণ পাইনি।","audioRef":"","audioDurationSec":0,"transcriptSource":"fixture","draftApproved":false,"appointment":{"clinicId":"cl-2","slotId":"s4","label":"Singair Community Legal Desk — Tomorrow 14:00"}}'::jsonb, '["Respondent name"]'::jsonb, now() - interval '1 day');

CREATE INDEX cases_priority_idx ON public.cases (safety_flag DESC, urgency, received_at DESC);
CREATE INDEX cases_category_idx ON public.cases (primary_category);
CREATE INDEX cases_status_idx ON public.cases (status);
CREATE INDEX training_sessions_staff_idx ON public.training_sessions (staff_id, started_at DESC);