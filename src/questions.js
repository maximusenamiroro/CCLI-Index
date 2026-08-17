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
        name: "Gender",
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
        label:
          "I know what factors affect the cost of living on campus (e.g., accommodation, food, transport).",
        type: "scale",
        scaleType: "yesno",
      },
      {
        name: "knowledge_2",
        label: "I understand how hostel or accommodation fees are determined.",
        type: "scale",
        scaleType: "yesno",
      },
      {
        name: "knowledge_3",
        label:
          "I am aware of financial aid, bursaries, or subsidy programs available to students like me.",
        type: "scale",
        scaleType: "yesno",
      },
      {
        name: "knowledge_4",
        label:
          "I know how to budget effectively to manage my monthly expenses.",
        type: "scale",
        scaleType: "yesno",
      },
      {
        name: "knowledge_5",
        label:
          "I understand how inflation or rising prices affects what I pay for goods and services on campus.",
        type: "scale",
        scaleType: "yesno",
      },
      {
        name: "attitude_1",
        label: "I think the current cost of living on campus is reasonable.",
        type: "scale",
        scaleType: "agree",
      },
      {
        name: "attitude_2",
        label: "The cost of living affects how well I can focus on my studies.",
        type: "scale",
        scaleType: "agree",
      },
      {
        name: "attitude_3",
        label:
          "I often feel stressed or anxious about my finances as a student.",
        type: "scale",
        scaleType: "agree",
      },
      {
        name: "attitude_4",
        label:
          "I feel my institution does enough to support students financially.",
        type: "scale",
        scaleType: "agree",
      },
      {
        name: "attitude_5",
        label:
          "I worry about whether I can afford my basic needs (food, housing, transport) each month.",
        type: "scale",
        scaleType: "agree",
      },
    ],
  },
  {
    title: "What you actually do",
    fields: [
      {
        name: "practice_1",
        label: "I have skipped meals because I didn't have enough money.",
        type: "scale",
        scaleType: "frequency",
      },
      {
        name: "practice_2",
        label: "I share a room or accommodation with others to reduce costs.",
        type: "scale",
        scaleType: "frequency",
      },
      {
        name: "practice_3",
        label:
          "I take up part-time jobs or side hustles to support myself financially.",
        type: "scale",
        scaleType: "frequency",
      },
      {
        name: "practice_4",
        label:
          "I walk instead of paying for transport, in order to save money.",
        type: "scale",
        scaleType: "frequency",
      },
    ],
  },
];

export const scaleOptions = {
  yesno: ["Yes", "No", "Not sure"],
  agree: [
    "Strongly disagree",
    "Disagree",
    "Neutral",
    "Agree",
    "Strongly agree",
  ],
  frequency: ["Never", "Rarely", "Sometimes", "Often", "Always"],
};
