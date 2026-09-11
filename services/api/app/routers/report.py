from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter(prefix="/report", tags=["Client Crime Reporting GD Wizard"])

class GDReportRequest(BaseModel):
    reporter_role: str # VICTIM or WITNESS
    incident_type: str
    district: str
    thana: str
    narrative: str
    incident_date: Optional[str] = "অনির্দিষ্ট তারিখ"
    suspect_info: Optional[str] = "অজ্ঞাতনামা ব্যক্তি"
    evidence_list: List[str] = []
    contact_name: Optional[str] = "নাম প্রকাশে অনিচ্ছুক"
    contact_phone: Optional[str] = "অনুপলব্ধ"
    is_anonymous: bool = False

@router.post("/generate-gd")
async def generate_gd_draft(req: GDReportRequest):
    # Rule BR-010: strictly does NOT insert into cases table!
    name = "নাম প্রকাশে অনিচ্ছুক" if req.is_anonymous else (req.contact_name or "নাম প্রকাশে অনিচ্ছুক")
    evidence_bullets = "\n".join([f"- {e}" for e in req.evidence_list]) if req.evidence_list else "- কোনো প্রাথমিক প্রমাণ সংযোজন করা হয়নি।"
    
    gd_text = f"""বরাবর,
অফিসার ইনচার্জ (OC)
{req.thana} থানা, {req.district}।

বিষয়: সাধারণ ডায়েরি (GD) করার আবেদন।

জনাব,
বিনীত নিবেদন এই যে, আমি নিম্নস্বাক্ষরকারী {name}, একজন সচেতন নাগরিক হিসেবে জানাচ্ছি যে, গত {req.incident_date} তারিখে নিম্নোক্ত ঘটনাটি ঘটেছে:

ঘটনার বিবরণ:
{req.narrative}

সন্দেহভাজন ব্যক্তি/আইডির তথ্য (যদি জানা থাকে):
{req.suspect_info}

সংরক্ষিত প্রমাণাদির তালিকা:
{evidence_bullets}

এমতাবস্থায়, ভবিষ্যৎ আইনি পদক্ষেপ ও নিরাপত্তার স্বার্থে বিষয়টি থানায় সাধারণ ডায়েরি (জিডি) হিসেবে অন্তর্ভুক্ত করার জন্য বিনীত অনুরোধ জানাচ্ছি।

বিনীত,
{name}
মোবাইল: {req.contact_phone if not req.is_anonymous else 'গোপন রাখা হয়েছে'}
তারিখ: সংগৃহীত তারিখ
[নোট: এই খসড়াটি অধিকার (Odhikar) প্ল্যাটফর্ম থেকে তৈরি। এটি এখনও থানায় দাখিল করা হয়নি।]
"""
    return {
        "gd_draft_text": gd_text,
        "disclaimer": "এটি ব্যবহারকারী কর্তৃক নিয়ন্ত্রিত জিডি খসড়া। প্ল্যাটফর্ম থেকে স্বয়ংক্রিয়ভাবে কোনো পুলিশ স্টেশনে পাঠানো হয়নি।"
    }