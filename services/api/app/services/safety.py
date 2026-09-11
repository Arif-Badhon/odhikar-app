import re
from typing import Dict, Any

URGENT_SAFETY_KEYWORDS_BN = [
    r"মেরে ফেল", r"মারধর", r"রক্ত", r"ছুরি", r"বন্দুক", r"হত্যা", r"হত্যার হুমকি",
    r"খুন", r"ধর্ষণ", r"শারীরিক নির্যাতন", r"হাসপাতাল", r"আহত", r"জীবননাশের হুমকি",
    r"বের করে দি", r"তাড়িয়ে দি"
]

def check_safety_rules(text: str) -> Dict[str, Any]:
    text_lower = text.lower()
    for pattern in URGENT_SAFETY_KEYWORDS_BN:
        if re.search(pattern, text_lower):
            return {
                "is_urgent": True,
                "reason": f"Matched critical safety risk keyword: {pattern}",
                "helpline_numbers": ["999", "109", "16430"]
            }
    return {
        "is_urgent": False,
        "reason": "No immediate violent threats detected.",
        "helpline_numbers": ["16430"]
    }