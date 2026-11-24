export const QUESTION_TYPE_KEYS = {
  MCQ: "mcq",
  "True/False": "truefalse",
  "Short Answer": "shortanswer",
  "Long Answer": "longanswer",
};

export const DIFFICULTY_ORDER = { easy: 0, medium: 1, hard: 2 };

export const PUBLIC_QUESTION_FIELDS = [
  "question_no",
  "question_id",
  "question_type",
  "difficulty_level",
  "question",
  "options",
];

export function buildQuestionSnapshot(test) {
  const flat = [];
  const questionsObj = test.questions || {};

  for (const [typeName, levels] of Object.entries(questionsObj)) {
    const typeKey = QUESTION_TYPE_KEYS[typeName] || typeName.toLowerCase().replace(/[^a-z]/g, "");

    const sortedLevels = Object.keys(levels || {}).sort(
      (a, b) => (DIFFICULTY_ORDER[a] ?? 9) - (DIFFICULTY_ORDER[b] ?? 9)
    );

    for (const level of sortedLevels) {
      const items = levels[level] || [];
      items.forEach((item, idx) => {
        const index = idx + 1;
        const q = {
          question_id: `${typeKey}_${level}_${index}`,
          type_key: typeKey,
          question_type: typeName,
          difficulty_level: level,
          question: item.question,
        };

        if (typeKey === "mcq") {
          let options = item.options || [];
          if (!Array.isArray(options) && typeof options === "object") {
            options = Object.entries(options).map(([k, v]) => ({
              option_id: String(k),
              text: v,
            }));
          } else {
            options = options.map((opt, i) =>
              typeof opt === "object"
                ? { option_id: String(opt.option_id || i + 1), text: opt.text }
                : { option_id: String(i + 1), text: opt }
            );
          }
          const correct = item.correct_option_id ?? item.correct_answer;
          q.options = options;
          q.correct_option_id = correct !== undefined ? String(correct) : null;
          q.correct_answer = correct;
        } else if (typeKey === "truefalse") {
          q.correct_answer = item.answer;
        } else {
          q.correct_answer = item.sample_answer;
          q.acceptable_answers = item.acceptable_answers || [];
          q.keywords = item.keywords || [];
          q.evaluation_rules = item.evaluation_rules || {};
          q.max_marks = item.marks || item.max_marks || 1;
        }

        flat.push(q);
      });
    }
  }

  return flat;
}

export function numberQuestions(questions) {
  return questions.map((q, idx) => ({
    ...q,
    question_no: idx + 1,
  }));
}

export function shuffledCopy(questions) {
  const copy = JSON.parse(JSON.stringify(questions));
  // Fisher-Yates shuffle
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  for (const q of copy) {
    if (q.type_key === "mcq" && Array.isArray(q.options)) {
      for (let i = q.options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [q.options[i], q.options[j]] = [q.options[j], q.options[i]];
      }
    }
  }
  return copy;
}

export function toPublicQuestion(q) {
  const pub = {};
  for (const field of PUBLIC_QUESTION_FIELDS) {
    if (q[field] !== undefined) {
      pub[field] = q[field];
    }
  }
  return pub;
}
