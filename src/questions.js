// All CCLI survey questions, organized into pages.
// "type" controls which input renders: text | number | radio | scale | textarea | checkbox | select
// Each name will be used to link them in the Database to where their response will go
//
// Rebuilt to match the revised F2 team PDF (Q1-29). Two additions kept from
// earlier work that aren't in the PDF but were explicitly requested: the
// university dropdown, and gender/course (kept for cross-university analysis).

import { nigerianUniversities } from './nigerian_universities'
import { nigerianCourses } from './nigerian_courses'

export const pages = [
  {
    title: "Basic information & housing",
    fields: [
      {
        name: "level",
        label: "What is your current level of study?",
        type: "radio",
        options: [
          "100 Level",
          "200 Level",
          "300 Level",
          "400 Level",
          "500 Level",
          "OND",
          "HND",
          "Other",
        ],
      },
      {
        name: "residence",
        label: "Where do you currently live?",
        type: "radio",
        options: ["On-campus", "Off-campus"],
      },
      // Not in the PDF, kept from earlier work for cross-university analysis.
      {
        name: "gender",
        label: "What is your gender?",
        type: "radio",
        options: ["Male", "Female", "Other"],
      },
      {
        name: "university",
        label: "Which university do you attend?",
        type: "combobox",
        groupedOptions: nigerianUniversities,
        placeholder: "Search for your school",
        helperText: "Search for your school. If it's not listed, you can add it manually.",
        // Manually-typed entries are saved to a shared Supabase table so
        // future students searching for the same school will find it.
        remoteGrowth: true,
      },
      {
        name: "course",
        label: "What is your course of study?",
        type: "combobox",
        groupedOptions: nigerianCourses,
        placeholder: "Search for your course",
        helperText: "Search for your course. If it's not listed, you can add it manually.",
        remoteGrowth: true,
      },
      {
        name: "accommodation_type",
        label: "What type of accommodation do you live in?",
        type: "radio",
        options: [
          "School hostel",
          "Private hostel",
          "Living with family/relative",
          "Bedsitter",
          "Self-contained apartment",
          "Shared apartment",
          "Other",
        ],
      },
      {
        name: "accommodation_spend",
        label: "How much do you spend on accommodation yearly?",
        type: "select",
        placeholder: "Select a range",
        options: [
          "Under ₦50,000",
          "₦50,000 – ₦100,000",
          "₦100,001 – ₦250,000",
          "₦250,001 – ₦500,000",
          "₦500,001 – ₦1,000,000",
          "Above ₦1,000,000",
        ],
      },
      {
        name: "apartment_search_difficulty",
        label: "How hard was it to find an apartment?",
        type: "scale",
        scaleType: "difficulty5",
      },
      {
        name: "apartment_search_factors",
        label: "What made it easy or hard? (Select all that apply)",
        type: "checkbox",
        options: [
          "Price/budget",
          "Location",
          "Finding a roommate",
          "Not enough apartments available",
          "Other",
        ],
      },
      {
        name: "apartment_search_challenges",
        label: "What challenges did you face when finding an apartment? (Select all that apply)",
        type: "checkbox",
        options: [
          "Budget/price too high",
          "Limited locations near campus",
          "Trouble finding a roommate",
          "Landlord requirements (credit check, income/cosigner, etc.)",
          "Limited apartment availability",
          "Lease terms (length, deposit, etc.)",
          "Language barrier",
          "Other",
        ],
      },
      // Unnumbered in the source PDF (appeared with no question number,
      // oddly placed under "Academic Expenses"). Housing-related, so
      // placed here -- flag if it should live elsewhere.
      {
        name: "electricity_access",
        label: "Do you have access to electricity (NEPA/national grid) at your apartment?",
        type: "radio",
        options: [
          "Yes, constant supply",
          "Yes, but irregular/inconsistent",
          "No, I rely on a generator",
          "No, I rely on solar",
          "No electricity access at all",
          "Other",
        ],
      },
    ],
  },
  {
    title: "Food, transport & other spending",
    fields: [
      {
        name: "food_spend",
        label: "How much do you spend on food per month?",
        type: "radio",
        options: [
          "Under ₦10,000",
          "₦10,000 – ₦20,000",
          "₦20,001 – ₦35,000",
          "₦35,001 – ₦50,000",
          "₦50,001 – ₦80,000",
          "Above ₦80,000",
        ],
      },
      {
        name: "food_source",
        label: "How do you mainly get your food?",
        type: "radio",
        options: ["I mostly cook", "I mostly buy food", "I do both"],
      },
      {
        name: "transport_means",
        label: "What is your main means of transportation?",
        type: "radio",
        options: [
          "Walking",
          "Bus",
          "Motorcycle",
          "Car",
          "Tricycle (Keke)",
          "Shuttle bus (Mariwa)",
          "Other",
        ],
      },
      {
        name: "transport_spend",
        label: "How much do you spend on transportation per month?",
        type: "radio",
        options: [
          "Under ₦3,000",
          "₦3,000 – ₦7,000",
          "₦7,001 – ₦15,000",
          "₦15,001 – ₦25,000",
          "Above ₦25,000",
        ],
      },
      {
        name: "enters_shuttle_keke_bike",
        label: "Do you enter a shuttle bus, keke or bike inside the campus?",
        type: "scale",
        scaleType: "yesno",
      },
      {
        name: "shuttle_keke_bike_daily_cost",
        label: "If you do, what is the cost per day? (leave blank if not applicable)",
        type: "radio",
        options: [
          "Under ₦200",
          "₦200 – ₦500",
          "₦501 – ₦1,000",
          "Above ₦1,000",
        ],
      },
      {
        name: "data_spend",
        label: "How much do you spend on data and airtime per month?",
        type: "radio",
        options: [
          "Under ₦2,000",
          "₦2,000 – ₦5,000",
          "₦5,001 – ₦10,000",
          "₦10,001 – ₦20,000",
          "Above ₦20,000",
        ],
      },
      {
        name: "network_provider",
        label: "What network provider do you mainly use?",
        type: "text",
      },
      {
        name: "network_provider_reason",
        label: "Why do you mainly use that network provider?",
        type: "textarea",
      },
      {
        name: "academic_spend",
        label: "How much do you spend on stationery, printing and photocopying per month?",
        type: "radio",
        options: [
          "Under ₦2,000",
          "₦2,000 – ₦5,000",
          "₦5,001 – ₦10,000",
          "₦10,001 – ₦20,000",
          "Above ₦20,000",
        ],
      },
      // Laundry section removed -- not present in this revision of the PDF.
      {
        name: "surprise_expense",
        label: "What expense has surprised you the most as a student?",
        type: "textarea",
      },
      {
        name: "budget_enough",
        label: "Is your monthly budget enough to live comfortably?",
        type: "radio",
        options: ["Yes", "No"],
      },
      {
        name: "budget_why",
        label: "Why do you feel your monthly budget is or is not enough?",
        type: "textarea",
      },
    ],
  },
  {
    title: "What you know & how you feel",
    fields: [
      {
        name: "knowledge_1",
        label: "Do you know how to apply for government student financial aid or bursaries?",
        type: "scale",
        scaleType: "yesno",
      },
      {
        name: "knowledge_2",
        label: "Have you heard of any government housing schemes targeted at students?",
        type: "scale",
        scaleType: "yesno",
      },
      {
        name: "knowledge_3",
        label: "Do you know which ministry/department is responsible for student welfare in your country?",
        type: "scale",
        scaleType: "yesno",
      },
      {
        name: "attitude_1",
        label: "Do you think there should be stronger government regulation of rent and housing prices for students?",
        type: "scale",
        scaleType: "agreedisagreenotsure",
      },
      {
        name: "attitude_2",
        label: "I believe corruption or mismanagement affects the delivery of government student welfare programs.",
        type: "scale",
        scaleType: "yesno",
      },
      {
        name: "attitude_3",
        label: "Do you feel government agencies prioritize student?",
        type: "scale",
        scaleType: "yesno",
        // Matches your PDF's literal wording exactly (looks like it may be
        // a typo/truncation in the source doc -- flag if you meant
        // "...prioritize student welfare?" and want it corrected).
      },
      {
        name: "attitude_4",
        label: "Have you ever applied for a government-sponsored student loan, bursary, or food subsidy program?",
        type: "scale",
        scaleType: "yesno",
      },
    ],
  },
  {
    title: "What would help",
    fields: [
      {
        name: "general_measures",
        label: "Which of the following measures do you think would most help reduce the cost of living for students? (Select all that apply)",
        type: "checkbox",
        options: [
          "Government rent regulation near campuses",
          "Increased student allowances/bursaries",
          "Subsidized public transport",
          "Affordable on-campus housing",
          "Meal subsidy programs",
          "Institutional emergency hardship funds",
          "Other",
        ],
      },
      {
        name: "detailed_measures",
        label: "Which of these measures do you think would help reduce the cost of living for students? (Tick all that apply)",
        type: "checkbox",
        groupedOptions: {
          Government: [
            "Set a maximum limit on rent prices near schools",
            "Give monthly allowances or stipends to students",
            "Provide free or discounted transport for students",
            "Build more affordable housing for students",
            "Control the prices of food and basic goods",
            "Give low-interest or interest-free student loans",
            "Create emergency funds for students in financial trouble",
            "Reduce taxes for families supporting students",
          ],
          "Institution/School": [
            "Build cheaper hostels/dormitories on campus",
            "Offer affordable food at the cafeteria",
            "Create part-time jobs for students on campus",
            "Give out more scholarships and grants",
            "Provide free or cheap textbooks and study materials",
            "Teach students how to budget and manage money",
            "Set up emergency support for students facing hardship",
            "Partner with local shops/landlords for student discounts",
          ],
        },
      },
    ],
  },
]

export const scaleOptions = {
  yesno: ["Yes", "No"],
  yesnoneutral: ["Yes", "No", "Neutral"],
  yesnounsure: ["Yes", "No", "Unsure"],
  agree: [
    "Strongly disagree",
    "Disagree",
    "Neutral",
    "Agree",
    "Strongly agree",
  ],
  agreedisagreenotsure: ["Agree", "Disagree", "Not sure"],
  frequency: ["Never", "Rarely", "Sometimes", "Often", "Always"],
  frequency3: ["Never", "Occasionally", "Regularly"],
  frequency4: ["Never", "Rarely", "Frequently", "Always"],
  yesnomaybe: ["Yes", "No", "Maybe"],
  effectiveness: [
    "Very Ineffective",
    "Ineffective",
    "Neutral",
    "Effective",
    "Very Effective",
  ],
  responsibility: [
    "Not Responsible",
    "Slightly Responsible",
    "Moderately Responsible",
    "Responsible",
    "Fully Responsible",
  ],
  fairness: ["Very Unfair", "Unfair", "Neutral", "Fair", "Very Fair"],
  confidence: [
    "Not Confident at All",
    "Slightly Confident",
    "Moderately Confident",
    "Confident",
    "Extremely Confident",
  ],
  difficulty5: ["Very easy", "Easy", "Neutral", "Hard", "Very hard"],
}