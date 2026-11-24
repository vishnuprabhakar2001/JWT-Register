const SHORT_ANSWER_MIN_COVERAGE = 0.6;
const LONG_ANSWER_MIN_COVERAGE = 0.5;
const NEAR_EXACT_RATIO = 0.85;
const MIN_LENGTH_SHARE = 0.3;
const MAX_ANSWER_CHARS = 5000;

const STOPWORDS = new Set([
  "a", "an", "the", "is", "are", "was", "were", "be", "been", "being",
  "of", "in", "on", "at", "to", "for", "from", "by", "with", "and",
  "or", "as", "that", "this", "these", "those", "it", "its", "which",
  "who", "whom", "into", "than", "then", "so", "such", "can", "could",
  "will", "would", "may", "might", "also", "has", "have", "had", "do",
  "does", "did", "not", "but", "if", "their", "there", "they", "them",
  "we", "you", "he", "she", "i", "his", "her", "our", "your",
]);

const TRUE_VALUES = new Set(["true", "t", "yes", "y", "1"]);
const FALSE_VALUES = new Set(["false", "f", "no", "n", "0"]);

function stem(word) {
  const suffixes = ["ingly", "edly", "ing", "ies", "ied", "ed", "es", "ly", "s"];
  for (const suffix of suffixes) {
    if (word.endsWith(suffix) && word.length - suffix.length >= 3) {
      const base = word.slice(0, -suffix.length);
      return suffix === "ies" || suffix === "ied" ? base + "y" : base;
    }
  }
  return word;
}

function words(text) {
  if (!text) return [];
  const matches = String(text).toLowerCase().match(/\w+/g);
  return matches || [];
}

function keyTerms(text) {
  const terms = new Set();
  for (const w of words(text)) {
    if (!STOPWORDS.has(w) && w.length > 1) {
      terms.add(stem(w));
    }
  }
  return terms;
}

function toText(value) {
  if (value === null || value === undefined) return "";
  return String(value).trim().slice(0, MAX_ANSWER_CHARS);
}

export function normalizeText(value) {
  return words(toText(value)).join(" ");
}

function similarityRatio(s1, s2) {
  if (s1 === s2) return 1.0;
  if (!s1 || !s2) return 0.0;
  let matches = 0;
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;
  for (let i = 0; i < shorter.length; i++) {
    if (s1[i] === s2[i]) matches++;
  }
  return (2.0 * matches) / (s1.length + s2.length);
}

export function gradeMcq(answer, question) {
  const text = toText(answer);
  if (!text) return false;

  const correctId = String(question.correct_option_id || question.correct_answer || "").trim();
  let options = question.options || [];

  if (!Array.isArray(options) && typeof options === "object") {
    options = Object.entries(options).map(([key, value]) => ({
      option_id: String(key),
      text: value,
    }));
  } else {
    options = options.map((item, index) =>
      typeof item === "object" ? item : { option_id: String(index + 1), text: item }
    );
  }

  // Check matching by option_id directly
  if (text.toLowerCase() === correctId.toLowerCase()) {
    return true;
  }

  // Check if option letter (e.g. A, B, C, D) matches
  const letterMatch = text.match(/^\s*([A-Za-z])\s*[\)\.\:]?\s*$/);
  if (letterMatch) {
    const letter = letterMatch[1].toUpperCase();
    if (letter === correctId.toUpperCase()) return true;
  }

  // Check if answer text matches the text of the correct option
  const correctOpt = options.find((opt) => String(opt.option_id) === correctId);
  if (correctOpt && correctOpt.text) {
    const normAns = normalizeText(text);
    const normOpt = normalizeText(correctOpt.text);
    if (normAns === normOpt) return true;
  }

  return false;
}

export function gradeTrueFalse(answer, question) {
  const text = toText(answer).toLowerCase();
  if (!text) return false;

  const correctVal = question.correct_answer;
  const correctBool =
    typeof correctVal === "boolean"
      ? correctVal
      : TRUE_VALUES.has(String(correctVal).toLowerCase());

  if (TRUE_VALUES.has(text) && correctBool === true) return true;
  if (FALSE_VALUES.has(text) && correctBool === false) return true;
  return false;
}

export function gradeShortOrLong(answer, question, isLong = false) {
  const text = toText(answer);
  if (!text) return false;

  const sampleAnswer = question.correct_answer || question.sample_answer || "";
  const acceptableAnswers = question.acceptable_answers || [];

  const normAns = normalizeText(text);
  if (!normAns) return false;

  // Check acceptable answers
  for (const acc of acceptableAnswers) {
    if (normAns === normalizeText(acc)) return true;
  }

  // Compare with sample answer
  const normSample = normalizeText(sampleAnswer);
  if (normAns === normSample) return true;

  if (similarityRatio(normAns, normSample) >= NEAR_EXACT_RATIO) {
    return true;
  }

  // Check key term coverage
  const sampleTerms = keyTerms(sampleAnswer);
  if (sampleTerms.size === 0) return true;

  const ansTerms = keyTerms(text);
  let covered = 0;
  for (const term of sampleTerms) {
    if (ansTerms.has(term)) covered++;
  }

  const coverage = covered / sampleTerms.size;
  const requiredCoverage = isLong ? LONG_ANSWER_MIN_COVERAGE : SHORT_ANSWER_MIN_COVERAGE;

  if (coverage >= requiredCoverage && text.length >= sampleAnswer.length * MIN_LENGTH_SHARE) {
    return true;
  }

  return false;
}

export function gradeAnswer(answer, question) {
  const typeKey = (question.type_key || question.question_type || "").toLowerCase().replace(/[^a-z]/g, "");
  if (typeKey.includes("mcq")) {
    return gradeMcq(answer, question);
  }
  if (typeKey.includes("truefalse")) {
    return gradeTrueFalse(answer, question);
  }
  if (typeKey.includes("long")) {
    return gradeShortOrLong(answer, question, true);
  }
  return gradeShortOrLong(answer, question, false);
}
