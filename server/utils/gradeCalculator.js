/**
 * Converts a total score (0-100) to a letter grade and remark.
 * Standard Nigerian university grading system.
 */
const calculateGrade = (totalScore) => {
  if (totalScore >= 70) return { grade: 'A',  remark: 'Pass' };
  if (totalScore >= 60) return { grade: 'B',  remark: 'Pass' };
  if (totalScore >= 50) return { grade: 'C',  remark: 'Pass' };
  if (totalScore >= 45) return { grade: 'D',  remark: 'Pass' };
  if (totalScore >= 40) return { grade: 'E',  remark: 'Pass' };
  return                       { grade: 'F',  remark: 'Fail' };
};

module.exports = { calculateGrade };