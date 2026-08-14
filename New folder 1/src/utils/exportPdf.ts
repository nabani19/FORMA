import { jsPDF } from 'jspdf';
import { UserProfile, MacroGoals, LoggedMeal } from '../types';

export function exportMealPlanPDF(
  loggedMeals: LoggedMeal[],
  userProfile: UserProfile,
  macroGoals: MacroGoals
) {
  const doc = new jsPDF();
  
  // Header styling
  doc.setFillColor(10, 10, 15);
  doc.rect(0, 0, 210, 297, 'F');
  
  // Title Header Box
  doc.setFillColor(0, 87, 255);
  doc.rect(14, 15, 182, 28, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('TRACKER AI — PERSONALIZED NUTRITION REPORT', 20, 32);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated for: ${userProfile.name} (${userProfile.goal.replace('_', ' ').toUpperCase()}) | Target: ${macroGoals.calories} kcal/day`, 20, 39);
  
  // Content Start
  let y = 55;
  
  // Macro Summary Box
  doc.setFillColor(26, 26, 36);
  doc.rect(14, y, 182, 22, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('DAILY TARGET MACROS:', 20, y + 9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Protein: ${macroGoals.proteinGrams}g  |  Carbs: ${macroGoals.carbsGrams}g  |  Fats: ${macroGoals.fatGrams}g  |  Budget: Rs.${userProfile.dailyBudgetInr}/day`, 20, y + 16);
  
  y += 32;
  
  // Render Logged Meals
  doc.setFillColor(39, 39, 48);
  doc.rect(14, y, 182, 10, 'F');
  doc.setTextColor(0, 87, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(`TODAY'S LOGGED MEALS (${loggedMeals.length})`, 18, y + 7);
  
  y += 14;
  
  doc.setTextColor(220, 220, 230);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  
  loggedMeals.forEach((meal) => {
    if (y > 250) {
      doc.addPage();
      doc.setFillColor(10, 10, 15);
      doc.rect(0, 0, 210, 297, 'F');
      y = 20;
    }
    
    doc.text(`• ${meal.foodItem.name} (${meal.servings}x) — ${meal.foodItem.calories * meal.servings} kcal | Protein: ${meal.foodItem.protein * meal.servings}g | Cost: Rs.${meal.foodItem.priceInr * meal.servings}`, 20, y);
    y += 8;
  });
  
  // Footer
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 130);
  doc.text('TRACker — Zero-Trust Autonomous Nutrition & Fitness System. For information purposes only.', 20, 285);
  
  doc.save(`TRACker_Nutrition_Report_${userProfile.name.replace(/\s+/g, '_')}.pdf`);
}
