// data/questions.js
// All 18 English challenges for Finding Mr. Gomez
// WIDA 1-2 appropriate

const QUESTIONS = {
  nurse: [
    {
      id: 'n1',
      type: 'mc',
      prompt: 'Mr. Gomez is not in class. There are tissues in the trash. How does he feel?',
      options: ['Happy', 'Sick', 'Hungry'],
      correct: 1,
      feedback: 'Yes! Tissues mean he might be sick.',
      spanish: '¿Cómo se siente? Sick = enfermo'
    },
    {
      id: 'n2',
      type: 'mc',
      prompt: 'Where do students go when they feel sick?',
      options: ['Cafeteria', 'Nurse’s Office', 'Gym'],
      correct: 1,
      feedback: 'Correct! The nurse helps sick students.',
      spanish: 'Nurse’s Office = enfermería'
    },
    {
      id: 'n3',
      type: 'mc',
      prompt: 'Complete the sentence: I have a ______.',
      options: ['headache', 'book', 'ball'],
      correct: 0,
      feedback: 'Good! Headache means your head hurts.',
      spanish: 'Headache = dolor de cabeza'
    }
  ],
  library: [
    {
      id: 'l1',
      type: 'mc',
      prompt: 'Read: Students must be quiet in the library. What does “quiet” mean?',
      options: ['Loud', 'Silent', 'Fast'],
      correct: 1,
      feedback: 'Yes, quiet means not loud.',
      spanish: 'Quiet = silencioso'
    },
    {
      id: 'l2',
      type: 'mc',
      prompt: 'The library has many books. Students can _____ there.',
      options: ['eat lunch', 'read and study', 'play soccer'],
      correct: 1,
      feedback: 'Correct! Libraries are for reading.',
      spanish: 'Read = leer'
    },
    {
      id: 'l3',
      type: 'mc',
      prompt: 'What is the main rule in the library?',
      options: ['Talk loudly', 'Be quiet', 'Run around'],
      correct: 1,
      feedback: 'Great! You must be quiet.',
      spanish: 'Be quiet = estar en silencio'
    }
  ],
  cafeteria: [
    {
      id: 'c1',
      type: 'mc',
      prompt: 'Choose the correct sentence.',
      options: ['She eat lunch.', 'She eats lunch.', 'She eating lunch.'],
      correct: 1,
      feedback: 'Yes! “She eats” is correct.',
      spanish: 'She eats = ella come'
    },
    {
      id: 'c2',
      type: 'mc',
      prompt: 'I _____ breakfast every morning.',
      options: ['eat', 'eats', 'eating'],
      correct: 0,
      feedback: 'Correct! With “I” we use “eat”.',
      spanish: 'I eat = yo como'
    },
    {
      id: 'c3',
      type: 'mc',
      prompt: 'Which sentence is correct?',
      options: ['The students is hungry.', 'The students are hungry.', 'The students am hungry.'],
      correct: 1,
      feedback: 'Good! “Students are” is plural.',
      spanish: 'Are = son/están'
    }
  ],
  office: [
    {
      id: 'o1',
      type: 'mc',
      prompt: 'Someone says “Good morning!” What is a good reply?',
      options: ['Goodbye!', 'Good morning!', 'I am sick.'],
      correct: 1,
      feedback: 'Yes! Answer with “Good morning!”',
      spanish: 'Good morning = Buenos días'
    },
    {
      id: 'o2',
      type: 'mc',
      prompt: 'The secretary asks “How can I help you?” What do you say?',
      options: ['I need a pass.', 'I am running.', 'Close the door.'],
      correct: 0,
      feedback: 'Correct! You ask for help.',
      spanish: 'I need = necesito'
    },
    {
      id: 'o3',
      type: 'mc',
      prompt: 'Choose the polite question.',
      options: ['Give me a form!', 'May I have a form, please?', 'Form now!'],
      correct: 1,
      feedback: 'Great! “May I” is polite.',
      spanish: 'May I = ¿puedo?'
    }
  ],
  counseling: [
    {
      id: 'co1',
      type: 'mc',
      prompt: 'Math is hard. _____ English is easy.',
      options: ['However', 'Both', 'And'],
      correct: 0,
      feedback: 'Yes! “However” shows contrast.',
      spanish: 'However = sin embargo'
    },
    {
      id: 'co2',
      type: 'mc',
      prompt: 'Both classes are interesting. “Both” means:',
      options: ['Only one', 'The two', 'None'],
      correct: 1,
      feedback: 'Correct! Both = the two things.',
      spanish: 'Both = ambos'
    },
    {
      id: 'co3',
      type: 'mc',
      prompt: 'Unlike soccer, basketball is played indoors. “Unlike” means:',
      options: ['The same', 'Different from', 'Also'],
      correct: 1,
      feedback: 'Good! Unlike shows difference.',
      spanish: 'Unlike = a diferencia de'
    }
  ],
  lounge: [
    {
      id: 'lo1',
      type: 'mc',
      prompt: 'Put in order: First, the teacher arrives. Next, students sit down. Finally, class starts.',
      options: ['Correct order', 'Wrong order', 'No order'],
      correct: 0,
      feedback: 'Yes! First → Next → Finally is the right sequence.',
      spanish: 'First = primero, Finally = finalmente'
    },
    {
      id: 'lo2',
      type: 'mc',
      prompt: 'What happens at the beginning of class?',
      options: ['Students leave', 'Teacher says hello', 'Class ends'],
      correct: 1,
      feedback: 'Correct! Class starts with greeting.',
      spanish: 'Beginning = comienzo'
    },
    {
      id: 'lo3',
      type: 'mc',
      prompt: 'Finally, the bell rings. “Finally” means:',
      options: ['At the start', 'In the middle', 'At the end'],
      correct: 2,
      feedback: 'Great! Finally = at the end.',
      spanish: 'Finally = finalmente'
    }
  ]
};

const MISSIONS = [
  { id: 'nurse', name: 'Nurse’s Office', room: 'nurse', clue: 'Find a place with many books. You can read and study there, but you must be quiet.', next: 'library', code: [2, 1, 5] },
  { id: 'library', name: 'Library', room: 'library', clue: 'Students go here when they are hungry. You can eat breakfast or lunch here.', next: 'cafeteria', code: [3, 7, 4] },
  { id: 'cafeteria', name: 'Cafeteria', room: 'cafeteria', clue: 'This is where you can find the principal and hear important school announcements.', next: 'office', code: [1, 8, 6] },
  { id: 'office', name: 'Main Office', room: 'office', clue: 'Sometimes students need help with their schedules, classes, or personal problems. Who can help them?', next: 'counseling', code: [9, 2, 3] },
  { id: 'counseling', name: 'Counseling Office', room: 'counseling', clue: 'Teachers sometimes go here to drink coffee, eat lunch, and relax during their breaks.', next: 'lounge', code: [4, 5, 1] },
  { id: 'lounge', name: 'Teachers’ Lounge', room: 'lounge', clue: 'Your teacher is closer than you think. Return to the classroom where your adventure began. Look at the room right next door.', next: 'room127', code: [7, 3, 8] }
];

// Export for use
if (typeof module !== 'undefined') module.exports = { QUESTIONS, MISSIONS };
