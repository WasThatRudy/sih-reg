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
    year: "2023",
    category: "Software",
    teamName: "TechInnovators",
    projectTitle: "Smart Healthcare Management System",
    members: ["Rahul Sharma", "Priya Patel", "Amit Kumar", "Sneha Singh"],
    achievement: "1st Prize - ₹1,00,000"
  },
  {
    year: "2023",
    category: "Hardware",
    teamName: "CircuitMasters",
    projectTitle: "IoT-based Smart Agriculture Solution",
    members: ["Vikash Gupta", "Anjali Verma", "Rohit Jain", "Kavya Reddy"],
    achievement: "2nd Prize - ₹75,000"
  },
  {
    year: "2022",
    category: "Software",
    teamName: "CodeCrafters",
    projectTitle: "AI-Powered Education Platform",
    members: ["Arjun Mehta", "Isha Agarwal", "Siddharth Roy", "Nisha Tiwari"],
    achievement: "1st Prize - ₹1,00,000"
  },
  {
    year: "2022",
    category: "Hardware",
    teamName: "InnovateTech",
    projectTitle: "Waste Management Automation System",
    members: ["Deepak Singh", "Meera Joshi", "Kunal Desai", "Ritu Sharma"],
    achievement: "3rd Prize - ₹50,000"
  },
  {
    year: "2021",
    category: "Software",
    teamName: "DigitalPioneers",
    projectTitle: "Blockchain-based Supply Chain Tracker",
    members: ["Manish Kumar", "Pooja Gupta", "Vivek Pandey", "Shruti Malhotra"],
    achievement: "1st Prize - ₹1,00,000"
  },
  {
    year: "2021",
    category: "Hardware",
    teamName: "RoboEngineers",
    projectTitle: "Autonomous Disaster Response Robot",
    members: ["Rajesh Yadav", "Sonal Dubey", "Harsh Agrawal", "Neha Saxena"],
    achievement: "2nd Prize - ₹75,000"
  }
];

export const statistics = [
  {
    number: "50,000+",
    label: "Students Participated",
    color: "heading"
  },
  {
    number: "10,000+",
    label: "Teams Registered",
    color: "subheading"
  },
  {
    number: "₹1.2Cr+",
    label: "Prize Money",
    color: "heading"
  },
  {
    number: "500+",
    label: "Problem Statements",
    color: "subheading"
  }
];
