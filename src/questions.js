// All CCLI survey questions, organized into 4 pages.
// "type" controls which input renders: text | number | radio | scale | textarea
// Each name will be used to link them in the Database to where their response will go
// like Level will have its own coloumn for the response of the students

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
          "Other",
        ],
      },
      {
        name: "residence",
        label: "Where do you currently live?",
        type: "radio",
        options: ["On-campus", "Off-campus"],
      },
      {
        name: "gender",
        label: "What is your gender?",
        type: "radio",
        options: ["Male", "Female", "Other"],
      },
      {
        name: "university",
        label: "Which university do you attend?",
        type: "text",
      },
      { name: "course", label: "What is your course of study?", type: "text" },
      {
        name: "university_type",
        label: "Is your university public or private?",
        type: "radio",
        options: ["Public university", "Private university"],
      },
      {
        name: "accommodation_type",
        label: "What type of accommodation do you live in?",
        type: "radio",
        options: [
          "School hostel",
          "Private hostel",
          "Self-contained apartment",
          "Shared apartment",
          "Living with family/relative",
          "Other",
        ],
      },
      {
        name: "accommodation_spend",
        label: "How much do you spend on accommodation per month?",
        type: "number",
        prefix: "₦",
      },
    ],
  },
  {
    title: "Food, transport & other spending",
    fields: [
      {
        name: "food_spend",
        label: "How much do you spend on food per month?",
        type: "number",
        prefix: "₦",
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
        options: ["Walking", "Bus", "Motorcycle", "Car", "Other"],
      },
      {
        name: "transport_spend",
        label: "How much do you spend on transportation per month?",
        type: "number",
        prefix: "₦",
      },
      {
        name: "data_spend",
        label: "How much do you spend on data and airtime per month?",
        type: "number",
        prefix: "₦",
      },
      {
        name: "academic_spend",
        label:
          "How much do you spend on stationery, printing and photocopying per month?",
        type: "number",
        prefix: "₦",
      },
      {
        name: "laundry_spend",
        label: "How much do you spend on laundry per month?",
        type: "number",
        prefix: "₦",
      },
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
  label: "Are you aware of current state or federal government financial aid/loan schemes available to university students?",
  type: "scale",
  scaleType: "yesnounsure", // NOTE: "yesnounsure" isn't in scaleOptions either — did you mean "yesno" (Yes/No/Not sure)? See note below.
},
{
  name: "knowledge_2",
  label: "Which government agency is primarily responsible for regulating student housing and off-campus rent caps in your state/region?",
  type: "text",
},
{
  name: "knowledge_3",
  label: "Do you know if your government provides public transport subsidies or reduced fares specifically for tertiary students?",
  type: "scale",
  scaleType: "yesno",
},
{
  name: "knowledge_4",
  label: "Are you aware of any government policy or subsidy regulating electricity and water tariffs for university student communities?",
  type: "scale", 
  scaleType: "yesnounsure",
},
{
  name: "knowledge_5",
  label: "Do you know if national statistical agencies (e.g., National Bureau of Statistics / Bureau of Labor Statistics) include student-specific consumer baskets when calculating national inflation?",
  type: "scale",
  scaleType: "yesno",
},
{
  name: "knowledge_6",
  label: "Are you aware of the statutory role of the Ministry of Education regarding price stability within and around campus environments?",
  type: "scale",
  scaleType: "yesnounsure",
},
{
  name: "knowledge_7",
  label: "Do you know the eligibility criteria required to access government-sponsored emergency relief or food assistance funds for students?",
  type: "scale",
  scaleType: "yesno",
},
{
  name: "attitude_1",
  label: "How effective do you feel government agencies are in preventing predatory rent pricing by private landlords around campus?",
  type: "scale",
  scaleType: "effectiveness",
},
{
  name: "attitude_2",
  label: "Do you believe government student loan/grant disbursement timelines are prompt enough to cushion campus inflation?",
  type: "scale",
  scaleType: "agree",
},
{
  name: "attitude_3",
  label: "In your opinion, to what extent is the government responsible for mitigating the rising cost of essential food items near universities?",
  type: "scale",
  scaleType: "responsibility",
},
{
  name: "attitude_4",
  label: "How fair do you rate current government-regulated campus transportation pricing relative to average student monthly allowances?",
  type: "scale",
  scaleType: "fairness",
},
{
  name: "attitude_5",
  label: "How confident are you that government policymakers consider student cost-of-living data when updating minimum wage or national economic policies?",
  type: "scale",
  scaleType: "confidence",
},
{
  name: "attitude_6",
  label: "Do you feel government agencies prioritize student welfare as heavily as other public sectors during economic downturns?",
  type: "scale",
  scaleType: "yesnoneutral",
},
    ],
  },
  {
    title: "What you actually do",
    fields: [
      {
        name: "practice_1",
        label: " ⁠Have you ever applied for a government-sponsored student loan, bursary, or food subsidy program?",
        type: "scale",
        scaleType: "yesno",
      },
      {
        name: "practice_2",
        label: "Have you ever reported price gouging (e.g., exorbitant rent or inflated transport fares) to a consumer protection agency or local government authority?",
        type: "scale",
        scaleType: "yesno",
      },
      {
        name: "practice_3",
        label:
          "How often do you utilize government-subsidized public transit or healthcare facilities to reduce your monthly living expenses?",
         type: "scale",
  scaleType: "frequency4", // or whatever key your renderer expects
  options: ["Never", "Rarely", "Frequently", "Always"],
      },
      {
        name: "practice_4",
        label:
          "Have you participated in campus union dialogues, surveys, or petitions directed at government agencies demanding cost-of-living interventions?",
        type: "scale",
        scaleType: "yesno",
      },
       {
        name: "practice_5",
        label:
          " ⁠How frequently do you actively seek out updates on government policy changes regarding student allowances, tax exemptions, or grants?",
          type: "scale",
  scaleType: "frequency3",
  options: ["Never", "Occasionally", "Regularly"],
      },
      {
  name: "practice_6",
  label:
    "What practical financial adjustment do you make when government aid fails to cover your monthly living index shortfall?",
  type: "radio",
  options: [
    "Taking part-time work",
    "Reducing meal intake",
    "Relying on family",
    "Peer borrowing",
    "Other",
  ],
},
{
  name: "practice_7", // adjust name to match your numbering
  label:
    "Would you actively contribute monthly price data to a student-led platform to help government agencies track the Campus Cost of Living Index in real time?",
  type: "scale",
  scaleType: "yesnomaybe",
  options: ["Yes", "No", "Maybe"],
},
    ],
  },
];

export const scaleOptions = {
  yesno: ["Yes", "No",],
   yesnoneutral: ["Yes", "No", "Neutral" ],
  yesnounsure: ["Yes", "No", "Unsure" ],
  agree: [
    "Strongly disagree",
    "Disagree",
    "Neutral",
    "Agree",
    "Strongly agree",
  ],
  frequency: ["Never", "Rarely", "Sometimes", "Often", "Always"],
  frequency3: ["Never", "Occasionally", "Regularly"],
  frequency4: ["Never", "Rarely", "Frequently", "Always"],
  yesnomaybe: ["Yes", "No", "Maybe"],
  effectiveness: ["Very Ineffective", "Ineffective", "Neutral", "Effective", "Very Effective"],
responsibility: ["Not Responsible", "Slightly Responsible", "Moderately Responsible", "Responsible", "Fully Responsible"],
fairness: ["Very Unfair", "Unfair", "Neutral", "Fair", "Very Fair"],
confidence: ["Not Confident at All", "Slightly Confident", "Moderately Confident", "Confident", "Extremely Confident"],
};
