import { Question } from './index';

/**
 * WASSCE Mathematics Question Bank
 * 30 questions covering key topics with Nigerian/West African context
 */
export const mathematicsQuestions: Question[] = [
  // ALGEBRA (6 questions)
  {
    id: 1,
    subject: 'Mathematics',
    topic: 'Algebra',
    difficulty: 'easy',
    question: 'Simplify: 3x + 5x - 2x',
    options: ['6x', '8x', '10x', '4x'],
    correctAnswer: 0,
    explanation: '3x + 5x - 2x = (3 + 5 - 2)x = 6x'
  },
  {
    id: 2,
    subject: 'Mathematics',
    topic: 'Algebra',
    difficulty: 'easy',
    question: 'If 2y - 3 = 7, find the value of y',
    options: ['y = 4', 'y = 5', 'y = 6', 'y = 7'],
    correctAnswer: 1,
    explanation: '2y - 3 = 7, 2y = 10, y = 5'
  },
  {
    id: 3,
    subject: 'Mathematics',
    topic: 'Algebra',
    difficulty: 'medium',
    question: 'Factorize completely: 6x² + 9x',
    options: ['3x(2x + 3)', '3(2x² + 3x)', 'x(6x + 9)', '6x(x + 3)'],
    correctAnswer: 0,
    explanation: 'Common factor is 3x: 6x² + 9x = 3x(2x + 3)'
  },
  {
    id: 4,
    subject: 'Mathematics',
    topic: 'Algebra',
    difficulty: 'medium',
    question: 'A trader bought goods for ₦x and sold them at a profit of 20%. What is the selling price?',
    options: ['₦1.2x', '₦0.8x', '₦1.02x', '₦0.2x'],
    correctAnswer: 0,
    explanation: 'Selling price = Cost + Profit = x + 0.2x = 1.2x'
  },
  {
    id: 5,
    subject: 'Mathematics',
    topic: 'Algebra',
    difficulty: 'hard',
    question: 'If 3^(2x) = 81, find x',
    options: ['x = 1', 'x = 2', 'x = 3', 'x = 4'],
    correctAnswer: 1,
    explanation: '3^(2x) = 81 = 3^4, therefore 2x = 4, x = 2'
  },
  {
    id: 6,
    subject: 'Mathematics',
    topic: 'Algebra',
    difficulty: 'hard',
    question: 'Make r the subject of the formula: A = π(r² + rh)',
    options: ['r = A/π - h', 'r = (A - πh)/π', 'r = A/(π + h)', 'Cannot be simplified'],
    correctAnswer: 3,
    explanation: 'This requires quadratic formula to solve completely, making it complex to isolate r'
  },

  // QUADRATIC EQUATIONS (6 questions)
  {
    id: 7,
    subject: 'Mathematics',
    topic: 'Quadratic Equations',
    difficulty: 'easy',
    question: 'Solve: x² = 16',
    options: ['x = ±4', 'x = 4 only', 'x = 8', 'x = ±8'],
    correctAnswer: 0,
    explanation: 'Taking square root of both sides: x = ±√16 = ±4'
  },
  {
    id: 8,
    subject: 'Mathematics',
    topic: 'Quadratic Equations',
    difficulty: 'easy',
    question: 'Factorize: x² - 9',
    options: ['(x - 3)(x + 3)', '(x - 9)(x + 1)', '(x - 3)²', 'x(x - 9)'],
    correctAnswer: 0,
    explanation: 'Difference of two squares: x² - 9 = (x - 3)(x + 3)'
  },
  {
    id: 9,
    subject: 'Mathematics',
    topic: 'Quadratic Equations',
    difficulty: 'medium',
    question: 'Solve: x² - 7x + 12 = 0',
    options: ['x = 2, 5', 'x = 3, 4', 'x = 1, 12', 'x = 2, 6'],
    correctAnswer: 1,
    explanation: 'Factorizing: (x - 3)(x - 4) = 0, so x = 3 or x = 4'
  },
  {
    id: 10,
    subject: 'Mathematics',
    topic: 'Quadratic Equations',
    difficulty: 'medium',
    question: 'A rectangular field has length (x + 5)m and width xm. If the area is 50m², find x',
    options: ['x = 5', 'x = 10', 'x = 15', 'x = 20'],
    correctAnswer: 0,
    explanation: 'x(x + 5) = 50, x² + 5x - 50 = 0, (x + 10)(x - 5) = 0, x = 5 (positive value)'
  },
  {
    id: 11,
    subject: 'Mathematics',
    topic: 'Quadratic Equations',
    difficulty: 'hard',
    question: 'Using the quadratic formula, solve: 2x² + 5x - 3 = 0',
    options: ['x = 0.5, -3', 'x = 1, -3', 'x = 0.5, 3', 'x = -0.5, 3'],
    correctAnswer: 0,
    explanation: 'x = [-5 ± √(25 + 24)]/4 = [-5 ± 7]/4, giving x = 0.5 or x = -3'
  },
  {
    id: 12,
    subject: 'Mathematics',
    topic: 'Quadratic Equations',
    difficulty: 'hard',
    question: 'The sum of two numbers is 12 and their product is 32. Find the numbers.',
    options: ['4 and 8', '2 and 10', '6 and 6', '3 and 9'],
    correctAnswer: 0,
    explanation: 'Let numbers be x and y: x + y = 12, xy = 32. Solving gives x = 4, y = 8'
  },

  // GEOMETRY (6 questions)
  {
    id: 13,
    subject: 'Mathematics',
    topic: 'Geometry',
    difficulty: 'easy',
    question: 'Calculate the perimeter of a square with side 8cm',
    options: ['32cm', '24cm', '16cm', '64cm'],
    correctAnswer: 0,
    explanation: 'Perimeter = 4 × side = 4 × 8 = 32cm'
  },
  {
    id: 14,
    subject: 'Mathematics',
    topic: 'Geometry',
    difficulty: 'easy',
    question: 'Find the area of a rectangle 12m long and 5m wide',
    options: ['60m²', '34m', '17m²', '120m²'],
    correctAnswer: 0,
    explanation: 'Area = length × width = 12 × 5 = 60m²'
  },
  {
    id: 15,
    subject: 'Mathematics',
    topic: 'Geometry',
    difficulty: 'medium',
    question: 'A circular field has radius 21m. Find its circumference. (Use π = 22/7)',
    options: ['132m', '66m', '1386m', '42m'],
    correctAnswer: 0,
    explanation: 'Circumference = 2πr = 2 × (22/7) × 21 = 132m'
  },
  {
    id: 16,
    subject: 'Mathematics',
    topic: 'Geometry',
    difficulty: 'medium',
    question: 'The area of a trapezium is 96cm². If the parallel sides are 10cm and 14cm, find the height',
    options: ['8cm', '6cm', '12cm', '4cm'],
    correctAnswer: 0,
    explanation: 'Area = ½(a + b)h, 96 = ½(10 + 14)h, 96 = 12h, h = 8cm'
  },
  {
    id: 17,
    subject: 'Mathematics',
    topic: 'Geometry',
    difficulty: 'hard',
    question: 'A cone has base radius 7cm and slant height 25cm. Find its curved surface area. (Use π = 22/7)',
    options: ['550cm²', '275cm²', '1100cm²', '154cm²'],
    correctAnswer: 0,
    explanation: 'Curved surface area = πrl = (22/7) × 7 × 25 = 550cm²'
  },
  {
    id: 18,
    subject: 'Mathematics',
    topic: 'Geometry',
    difficulty: 'hard',
    question: 'A rectangular water tank 5m by 4m by 2m is filled with water. How many liters does it contain? (1m³ = 1000 liters)',
    options: ['40,000 liters', '20,000 liters', '4,000 liters', '40 liters'],
    correctAnswer: 0,
    explanation: 'Volume = 5 × 4 × 2 = 40m³ = 40 × 1000 = 40,000 liters'
  },

  // TRIGONOMETRY (6 questions)
  {
    id: 19,
    subject: 'Mathematics',
    topic: 'Trigonometry',
    difficulty: 'easy',
    question: 'If sin θ = 0.5, what is the value of θ? (0° < θ < 90°)',
    options: ['30°', '45°', '60°', '90°'],
    correctAnswer: 0,
    explanation: 'sin 30° = 0.5 or 1/2'
  },
  {
    id: 20,
    subject: 'Mathematics',
    topic: 'Trigonometry',
    difficulty: 'easy',
    question: 'What is cos 0°?',
    options: ['1', '0', '-1', '∞'],
    correctAnswer: 0,
    explanation: 'cos 0° = 1 (standard trigonometric value)'
  },
  {
    id: 21,
    subject: 'Mathematics',
    topic: 'Trigonometry',
    difficulty: 'medium',
    question: 'In a right-angled triangle, if the opposite side is 3cm and the hypotenuse is 5cm, find sin θ',
    options: ['0.6', '0.8', '0.75', '0.5'],
    correctAnswer: 0,
    explanation: 'sin θ = opposite/hypotenuse = 3/5 = 0.6'
  },
  {
    id: 22,
    subject: 'Mathematics',
    topic: 'Trigonometry',
    difficulty: 'medium',
    question: 'A ladder 10m long leans against a wall making an angle of 60° with the ground. How high up the wall does it reach?',
    options: ['8.66m', '5m', '10m', '7.5m'],
    correctAnswer: 0,
    explanation: 'Height = 10 × sin 60° = 10 × 0.866 = 8.66m'
  },
  {
    id: 23,
    subject: 'Mathematics',
    topic: 'Trigonometry',
    difficulty: 'hard',
    question: 'Simplify: sin²θ + cos²θ',
    options: ['1', '0', 'sin θ', 'cos θ'],
    correctAnswer: 0,
    explanation: 'This is a fundamental trigonometric identity: sin²θ + cos²θ = 1'
  },
  {
    id: 24,
    subject: 'Mathematics',
    topic: 'Trigonometry',
    difficulty: 'hard',
    question: 'From the top of a 50m building, the angle of depression to a car is 30°. How far is the car from the base of the building?',
    options: ['86.6m', '50m', '25m', '100m'],
    correctAnswer: 0,
    explanation: 'Distance = 50/tan 30° = 50/0.577 ≈ 86.6m'
  },

  // STATISTICS (6 questions)
  {
    id: 25,
    subject: 'Mathematics',
    topic: 'Statistics',
    difficulty: 'easy',
    question: 'Find the mean of these numbers: 2, 4, 6, 8, 10',
    options: ['6', '5', '7', '8'],
    correctAnswer: 0,
    explanation: 'Mean = (2 + 4 + 6 + 8 + 10)/5 = 30/5 = 6'
  },
  {
    id: 26,
    subject: 'Mathematics',
    topic: 'Statistics',
    difficulty: 'easy',
    question: 'Find the median of: 3, 7, 2, 9, 5',
    options: ['5', '7', '3', '9'],
    correctAnswer: 0,
    explanation: 'Arranging in order: 2, 3, 5, 7, 9. The middle value is 5'
  },
  {
    id: 27,
    subject: 'Mathematics',
    topic: 'Statistics',
    difficulty: 'medium',
    question: 'The test scores of 5 students are: 65, 70, 65, 80, 70. What is the mode?',
    options: ['Both 65 and 70', '65', '70', '80'],
    correctAnswer: 0,
    explanation: 'Mode is the most frequent value. Both 65 and 70 appear twice (bimodal)'
  },
  {
    id: 28,
    subject: 'Mathematics',
    topic: 'Statistics',
    difficulty: 'medium',
    question: 'A student scored 15, 18, 20, 17, 15 in five tests. Find the range',
    options: ['5', '15', '17', '20'],
    correctAnswer: 0,
    explanation: 'Range = Highest - Lowest = 20 - 15 = 5'
  },
  {
    id: 29,
    subject: 'Mathematics',
    topic: 'Statistics',
    difficulty: 'hard',
    question: 'The ages of 5 children in a Lagos family are 2, 4, 6, 8, and x. If their mean age is 5, find x',
    options: ['5', '3', '7', '10'],
    correctAnswer: 0,
    explanation: '(2 + 4 + 6 + 8 + x)/5 = 5, therefore 20 + x = 25, x = 5'
  },
  {
    id: 30,
    subject: 'Mathematics',
    topic: 'Statistics',
    difficulty: 'hard',
    question: 'In a class of 40 students, 25 passed Mathematics and 20 passed English. If 5 failed both subjects, how many passed both?',
    options: ['10', '15', '5', '20'],
    correctAnswer: 0,
    explanation: 'Using set theory: n(M ∪ E) = 40 - 5 = 35. n(M ∩ E) = 25 + 20 - 35 = 10'
  }
];