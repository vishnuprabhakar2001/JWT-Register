import mongoose from "mongoose";
import ApiError from "../utils/ApiError.js";
import { Test } from "../models/Test.model.js";
import { Question } from "../models/Question.model.js";
import { QuestionSummary } from "../models/QuestionSummary.model.js";
import { OrganisationDocument } from "../models/OrganisationDocument.model.js";
import { AssignTest } from "../models/AssignTest.model.js";

const DEFAULT_QUESTION_TYPES = ["MCQ", "True/False", "Short Answer", "Long Answer"];
const DEFAULT_DIFFICULTIES = ["easy", "medium", "hard"];

function generateSampleQuestions(fileId, docName) {
  return {
    MCQ: {
      easy: [
        {
          question_no: 1,
          question: `What is the primary concept discussed in ${docName}?`,
          options: ["Core Fundamentals", "Advanced Physics", "Ancient History", "None of the above"],
          correct_option_id: "1",
          correct_answer: "Core Fundamentals",
          explanation: "As stated in the source document.",
        },
      ],
      medium: [
        {
          question_no: 2,
          question: `Which technique applies best according to ${docName}?`,
          options: ["Method A", "Method B", "Standard Process", "Experimental"],
          correct_option_id: "3",
          correct_answer: "Standard Process",
          explanation: "Standard processes provide stability.",
        },
      ],
      hard: [
        {
          question_no: 3,
          question: `Analyze the primary architectural consideration in ${docName}.`,
          options: ["Scalability", "Syntax", "Styling", "Documentation"],
          correct_option_id: "1",
          correct_answer: "Scalability",
          explanation: "Scalability is central to design.",
        },
      ],
    },
    "True/False": {
      easy: [
        {
          question_no: 4,
          question: `Is the document relevant to the assigned grade curriculum?`,
          answer: "True",
          correct_answer: "True",
          explanation: "Verified by syllabus.",
        },
      ],
    },
    "Short Answer": {
      medium: [
        {
          question_no: 5,
          question: `Define the core topic of ${docName} in one sentence.`,
          sample_answer: `The document explores the foundational concepts and workflows of ${docName}.`,
          acceptable_answers: [`Fundamentals of ${docName}`, `Concepts of ${docName}`],
          keywords: ["fundamentals", "concepts", "workflow"],
          marks: 2,
        },
      ],
    },
    "Long Answer": {
      hard: [
        {
          question_no: 6,
          question: `Explain the key conclusions drawn in ${docName}.`,
          sample_answer: `The document outlines key conclusions including implementation best practices and structured workflows.`,
          acceptable_answers: [],
          keywords: ["implementation", "best practices", "workflow"],
          marks: 5,
        },
      ],
    },
  };
}

export const createTestFromDataSource = async (payload, currentAdmin) => {
  const { file_id, test_title, question_types, difficulty_levels, num_questions, duration } = payload;
  if (!file_id || !test_title) {
    throw new ApiError(400, "file_id and test_title are required.");
  }

  const adminId = currentAdmin._id;
  const orgId = String(currentAdmin.organisation_id || adminId);

  const doc = await OrganisationDocument.findOne({
    file_id,
    organisation_admin_id: String(adminId),
  });
  if (!doc) {
    throw new ApiError(404, "Source document not found for this organisation.");
  }

  // Check if questions exist in question bank or generate sample/AI
  let questionBank = await Question.find({ file_id });
  let questionsSnapshot = {};

  if (questionBank.length > 0) {
    for (const qb of questionBank) {
      if (!questionsSnapshot[qb.question_type]) {
        questionsSnapshot[qb.question_type] = {};
      }
      questionsSnapshot[qb.question_type][qb.difficulty_level] = qb.questions;
    }
  } else {
    // Generate questions snapshot
    questionsSnapshot = generateSampleQuestions(file_id, doc.document_name);
  }

  const selectedTypes = question_types?.length ? question_types : DEFAULT_QUESTION_TYPES;
  const selectedDiffs = difficulty_levels?.length ? difficulty_levels : DEFAULT_DIFFICULTIES;

  // Filter questions snapshot to match requested types & difficulties
  const filteredQuestions = {};
  let totalCount = 0;
  for (const t of selectedTypes) {
    if (questionsSnapshot[t]) {
      filteredQuestions[t] = {};
      for (const d of selectedDiffs) {
        if (questionsSnapshot[t][d]) {
          filteredQuestions[t][d] = questionsSnapshot[t][d];
          totalCount += questionsSnapshot[t][d].length;
        }
      }
    }
  }

  const newTest = await Test.create({
    test_title,
    file_id,
    file_name: doc.document_name,
    grade_id: doc.grade_id,
    grade: doc.grade,
    section: doc.section,
    subject_id: doc.subject_id,
    subject_name: doc.subject_name,
    num_questions: num_questions || totalCount || 10,
    question_types: selectedTypes,
    difficulty_levels: selectedDiffs,
    language: payload.language || "English",
    duration: duration || 30,
    total_marks: totalCount * 2,
    questions: filteredQuestions,
    organisation_admin_id: String(adminId),
    organisation_id: orgId,
    created_by: adminId,
  });

  return {
    success: true,
    message: "Test created successfully.",
    data: {
      test_id: String(newTest._id),
      test_title: newTest.test_title,
      grade_id: newTest.grade_id,
      grade: newTest.grade,
      section: newTest.section,
      subject_id: newTest.subject_id,
      subject_name: newTest.subject_name,
      num_questions: newTest.num_questions,
      duration: newTest.duration,
      created_at: newTest.created_at,
    },
  };
};

export const listTests = async (currentAdmin) => {
  const adminId = String(currentAdmin._id);
  const tests = await Test.find({ organisation_admin_id: adminId }).sort({ created_at: -1 });

  return {
    success: true,
    message: "Tests fetched successfully.",
    data: tests.map((t) => ({
      test_id: String(t._id),
      test_title: t.test_title,
      file_id: t.file_id,
      file_name: t.file_name,
      grade_id: t.grade_id,
      grade: t.grade,
      section: t.section,
      subject_id: t.subject_id,
      subject_name: t.subject_name,
      num_questions: t.num_questions,
      duration: t.duration,
      created_at: t.created_at,
    })),
  };
};

export const getTest = async (testId, currentAdmin) => {
  if (!mongoose.Types.ObjectId.isValid(testId)) {
    throw new ApiError(400, "Invalid Test ID.");
  }
  const adminId = String(currentAdmin._id);
  const test = await Test.findOne({ _id: testId, organisation_admin_id: adminId });
  if (!test) {
    throw new ApiError(404, "Test not found.");
  }

  return {
    success: true,
    message: "Test fetched successfully.",
    data: {
      test_id: String(test._id),
      test_title: test.test_title,
      file_id: test.file_id,
      file_name: test.file_name,
      grade_id: test.grade_id,
      grade: test.grade,
      section: test.section,
      subject_id: test.subject_id,
      subject_name: test.subject_name,
      num_questions: test.num_questions,
      duration: test.duration,
      questions: test.questions,
      created_at: test.created_at,
    },
  };
};

export const deleteTest = async (testId, currentAdmin) => {
  if (!mongoose.Types.ObjectId.isValid(testId)) {
    throw new ApiError(400, "Invalid Test ID.");
  }
  const adminId = String(currentAdmin._id);
  const result = await Test.deleteOne({ _id: testId, organisation_admin_id: adminId });
  if (result.deletedCount === 0) {
    throw new ApiError(404, "Test not found.");
  }

  await AssignTest.deleteMany({ test_id: testId });

  return {
    success: true,
    message: "Test deleted successfully.",
  };
};

export const createTestFromDataSourceController = async (req, res) => {
  const result = await createTestFromDataSource(req.body, req.current_admin);
  return res.status(201).json(result);
};

export const listTestsController = async (req, res) => {
  const result = await listTests(req.current_admin);
  return res.status(200).json(result);
};

export const getTestController = async (req, res) => {
  const result = await getTest(req.params.test_id, req.current_admin);
  return res.status(200).json(result);
};

export const deleteTestController = async (req, res) => {
  const result = await deleteTest(req.params.test_id, req.current_admin);
  return res.status(200).json(result);
};
