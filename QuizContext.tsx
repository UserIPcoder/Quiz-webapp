import React, { createContext, useContext, useReducer } from 'react';
import { QuizContextType, QuizState, Question } from '../types/quiz';
import { quizQuestions, shuffleQuestions } from '../data/quizData';

type QuizAction =
  | { type: 'SELECT_ANSWER'; payload: number }
  | { type: 'NEXT_QUESTION' }
  | { type: 'RESTART_QUIZ' };

const initialQuestions = shuffleQuestions(quizQuestions);

const initialState: QuizState = {
  questions: initialQuestions,
  currentQuestionIndex: 0,
  selectedAnswers: Array(initialQuestions.length).fill(null),
  showResults: false,
  isAnswerSelected: false,
};

const quizReducer = (state: QuizState, action: QuizAction): QuizState => {
  switch (action.type) {
    case 'SELECT_ANSWER':
      const newSelectedAnswers = [...state.selectedAnswers];
      newSelectedAnswers[state.currentQuestionIndex] = action.payload;
      return {
        ...state,
        selectedAnswers: newSelectedAnswers,
        isAnswerSelected: true,
      };
    case 'NEXT_QUESTION':
      const nextIndex = state.currentQuestionIndex + 1;
      const showResults = nextIndex >= state.questions.length;
      return {
        ...state,
        currentQuestionIndex: nextIndex,
        showResults,
        isAnswerSelected: false,
      };
    case 'RESTART_QUIZ':
      return {
        ...initialState,
        questions: shuffleQuestions(quizQuestions),
      };
    default:
      return state;
  }
};

const QuizContext = createContext<QuizContextType | undefined>(undefined);

export const QuizProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(quizReducer, initialState);

  const selectAnswer = (answerIndex: number) => {
    dispatch({ type: 'SELECT_ANSWER', payload: answerIndex });
  };

  const goToNextQuestion = () => {
    dispatch({ type: 'NEXT_QUESTION' });
  };

  const restartQuiz = () => {
    dispatch({ type: 'RESTART_QUIZ' });
  };

  const calculateScore = (): number => {
    return state.selectedAnswers.reduce((score, selected, index) => {
      return selected === state.questions[index].correctAnswer ? score + 1 : score;
    }, 0);
  };

  const calculatePercentage = (): number => {
    const score = calculateScore();
    return Math.round((score / state.questions.length) * 100);
  };

  return (
    <QuizContext.Provider
      value={{
        state,
        selectAnswer,
        goToNextQuestion,
        restartQuiz,
        calculateScore,
        calculatePercentage,
      }}
    >
      {children}
    </QuizContext.Provider>
  );
};

export const useQuiz = (): QuizContextType => {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
};