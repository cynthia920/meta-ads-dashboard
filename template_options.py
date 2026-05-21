"""Shared enum values for Meta ads CSV/Excel templates.

These mirror the Meta Marketing API enums. Keep this file the single source of
truth so the CSV header, the Excel template, and the uploader stay in sync.
"""

CAMPAIGN_OBJECTIVES = [
    "OUTCOME_AWARENESS",
    "OUTCOME_TRAFFIC",
    "OUTCOME_ENGAGEMENT",
    "OUTCOME_LEADS",
    "OUTCOME_APP_PROMOTION",
    "OUTCOME_SALES",
]

SPECIAL_AD_CATEGORIES = [
    "NONE",
    "HOUSING",
    "CREDIT",
    "EMPLOYMENT",
    "ISSUES_ELECTIONS_POLITICS",
    "ONLINE_GAMBLING_AND_GAMING",
    "FINANCIAL_PRODUCTS_SERVICES",
]

BILLING_EVENTS = [
    "IMPRESSIONS",
    "LINK_CLICKS",
    "POST_ENGAGEMENT",
    "VIDEO_VIEWS",
    "THRUPLAY",
]

OPTIMIZATION_GOALS = [
    "REACH",
    "IMPRESSIONS",
    "LINK_CLICKS",
    "LANDING_PAGE_VIEWS",
    "POST_ENGAGEMENT",
    "PAGE_LIKES",
    "VIDEO_VIEWS",
    "THRUPLAY",
    "OFFSITE_CONVERSIONS",
    "VALUE",
    "LEAD_GENERATION",
    "QUALITY_LEAD",
    "CONVERSATIONS",
    "APP_INSTALLS",
    "AD_RECALL_LIFT",
]

CTAS = [
    "SHOP_NOW",
    "LEARN_MORE",
    "SIGN_UP",
    "SUBSCRIBE",
    "DOWNLOAD",
    "BOOK_TRAVEL",
    "CONTACT_US",
    "GET_OFFER",
    "GET_QUOTE",
    "APPLY_NOW",
    "ORDER_NOW",
    "DONATE_NOW",
    "INSTALL_APP",
    "USE_APP",
    "WATCH_MORE",
    "LISTEN_NOW",
    "SEND_MESSAGE",
    "MESSAGE_PAGE",
    "GET_DIRECTIONS",
    "CALL_NOW",
    "NO_BUTTON",
]

COLUMNS = [
    ("campaign_name", None),
    ("campaign_objective", CAMPAIGN_OBJECTIVES),
    ("special_ad_categories", SPECIAL_AD_CATEGORIES),
    ("adset_name", None),
    ("daily_budget_usd", None),
    ("billing_event", BILLING_EVENTS),
    ("optimization_goal", OPTIMIZATION_GOALS),
    ("saved_audience_id", None),
    ("countries", None),
    ("age_min", None),
    ("age_max", None),
    ("page_id", None),
    ("ad_name", None),
    ("image_url", None),
    ("primary_text", None),
    ("headline", None),
    ("description", None),
    ("link_url", None),
    ("cta", CTAS),
]
