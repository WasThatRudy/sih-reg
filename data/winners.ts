export interface Winner {
  year: string;
  category: string;
  teamName: string;
  projectTitle: string;
  members: string[];
  achievement: string;
}

export const winners: Winner[] = [
  {
    year: "2024",
    category: "Software",
    teamName: "LAN Lords",
    projectTitle: "SCADA Network Topology Discovery and Monitoring",
    members: ["Vivek Agarwal", "Naman Parlecha", "Mritunjay Singh", "Samyak Sharma", "Taneesha Madhu", "Pahal Srivastava"],
    achievement: "Winner - SIH 2024"
  },
  {
    year: "2024",
    category: "Hardware",
    teamName: "405_Resolved",
    projectTitle: "SurakshaSanchay - Hardware Inventory Management in police department",
    members: ["Bhoomi Agrawal", "Kamini Banait", "Prajwal KP", "Shruti Sinha", "Ritvik K", "Aryan Gautam"],
    achievement: "Winner - SIH 2024"
  },
  {
    year: "2024",
    category: "Software",
    teamName: "Radar Vision",
    projectTitle: "Micro-Doppler Based Target Classification - SIH1606",
    members: ["Inchara J", "Shravya H Jain", "Diptangshu Bej", "Anand Raut", "Chethan Anathahalli Cheluvaraja", "Likith Manjunatha"],
    achievement: "Winner - SIH 2024"
  },
  {
    year: "2023",
    category: "Software",
    teamName: "insert_team_name",
    projectTitle: "Create a platform to connect legal service providers with customers",
    members: ["Keshab Kataruka", "Debayan Ghosh Dastider", "Madhur Mehta", "Drishtant Ranjan Srivastava", "Palak Khandelwal", "Rishab Sharma"],
    achievement: "Winner - SIH 2023"
  },
  {
    year: "2022",
    category: "Software",
    teamName: "Cheatcodes Inc.",
    projectTitle: "Misinformation Flagging System",
    members: ["Kritik Modi", "Ritabrata Nag", "Shubham Shresth", "Pururaj Singh Rajput", "Shreya N", "Sooraj Kumar"],
    achievement: "Winner - SIH 2022"
  },
  {
    year: "2022",
    category: "Software",
    teamName: "HUM BHI BANA LENGE",
    projectTitle: "Unknown",
    members: ["Dinesh A", "Vinit Hanabar", "Prince Thakkar", "Janvi Kumar", "Ishika Jain", "Dheeraj Gajuta"],
    achievement: "Winner - SIH 2022"
  },
  {
    year: "2019",
    category: "Hardware",
    teamName: "Arcis",
    projectTitle: "Smart Workout Sleeve",
    members: ["Ashutosh Pandey", "Bapu Pruthvidhar", "M C Pooja", "Vaishnavi L", "Ravi Maurya", "Nayan Ganguli"],
    achievement: "Winner - SIH 2019"
  }
];

export const statistics = [
  {
    number: "15L+",
    label: "Students Participated",
    color: "heading"
  },
  {
    number: "50,000+",
    label: "Teams Registered",
    color: "subheading"
  },
  {
    number: "₹100Cr+",
    label: "Prize Money",
    color: "heading"
  },
  {
    number: "1000+",
    label: "Problem Statements",
    color: "subheading"
  }
];
