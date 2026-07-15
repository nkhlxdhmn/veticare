export const mockAnimals = [
  {
    id: "1",
    name: "Golden Retriever",
    category: "Dog",
    description: "Intelligent, friendly, and devoted. Golden Retrievers are great family dogs and very trainable.",
    image: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=800",
    lifespan: "10-12 years",
    weight: "55-75 lbs"
  },
  {
    id: "2",
    name: "Persian Cat",
    category: "Cat",
    description: "Known for their long, luxurious coats and sweet personalities, Persians are relaxed and affectionate.",
    image: "https://images.unsplash.com/photo-1513245543132-31f507417b26?auto=format&fit=crop&q=80&w=800",
    lifespan: "12-17 years",
    weight: "7-12 lbs"
  },
  {
    id: "3",
    name: "French Bulldog",
    category: "Dog",
    description: "Playful, alert, and adaptable. Frenchies have a charming personality and require minimal exercise.",
    image: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=800",
    lifespan: "10-12 years",
    weight: "16-28 lbs"
  }
];

export const mockPetRecords = [
  {
    id: "1",
    name: "Bella",
    species: "Dog",
    breed: "Golden Retriever",
    age: "3 years",
    weight: "62 lbs",
    lastVisit: "2026-05-12",
    status: "Healthy"
  },
  {
    id: "2",
    name: "Milo",
    species: "Cat",
    breed: "British Shorthair",
    age: "5 years",
    weight: "11 lbs",
    lastVisit: "2026-06-20",
    status: "Needs Checkup"
  }
];

export const mockVaccinations = [
  {
    id: "1",
    petName: "Bella",
    vaccine: "Rabies",
    dateAdministered: "2025-05-12",
    nextDueDate: "2026-05-12",
    status: "Overdue"
  },
  {
    id: "2",
    petName: "Bella",
    vaccine: "DHPP",
    dateAdministered: "2025-05-12",
    nextDueDate: "2028-05-12",
    status: "Up to Date"
  },
  {
    id: "3",
    petName: "Milo",
    vaccine: "FVRCP",
    dateAdministered: "2026-06-20",
    nextDueDate: "2027-06-20",
    status: "Up to Date"
  }
];

export const mockCareGuides = [
  {
    category: "Nutrition",
    dos: [
      "Feed a balanced, high-quality diet appropriate for age and breed.",
      "Provide fresh water daily.",
      "Measure food to prevent obesity."
    ],
    donts: [
      "Don't feed table scraps or human food.",
      "Don't change diet abruptly.",
      "Don't overfeed treats (keep under 10% of daily calories)."
    ]
  },
  {
    category: "Exercise",
    dos: [
      "Provide daily physical activity.",
      "Include mental stimulation (puzzles, training).",
      "Adjust exercise intensity based on weather."
    ],
    donts: [
      "Don't exercise vigorously right after meals.",
      "Don't force a tired pet to keep playing.",
      "Don't ignore signs of heatstroke."
    ]
  }
];

export const mockServices = [
  {
    id: "1",
    name: "City Veterinary Clinic",
    address: "123 Main St, Downtown",
    distance: "1.2 miles",
    rating: 4.8,
    type: "General Practice"
  },
  {
    id: "2",
    name: "Paws & Claws Animal Hospital",
    address: "456 Oak Ave, Westside",
    distance: "3.5 miles",
    rating: 4.9,
    type: "Emergency Care"
  },
  {
    id: "3",
    name: "Sunny Days Pet Grooming",
    address: "789 Pine Blvd, Eastside",
    distance: "2.1 miles",
    rating: 4.7,
    type: "Grooming & Wellness"
  }
];
