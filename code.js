const fs = require('fs');
const { DateTime } = require('luxon');

function generateBalanceSheet(inputFile) {
  const data = fs.readFileSync(inputFile);
  const { expenseData, revenueData } = JSON.parse(data);

  const balanceSheet = [];

  // Determine the start and end months
  const startDate = getStartDate(revenueData, expenseData);
  const endDate = getEndDate(revenueData, expenseData);

  // Create a map to store amounts for each month
  const amountsMap = new Map();

  // Initialize balanceSheet object with monthly keys
  let currentMonth = startDate;
  while (currentMonth <= endDate) {
    const key = currentMonth.toFormat('yyyy-MM');
    amountsMap.set(key, 0);
    currentMonth = currentMonth.plus({ months: 1 });
  }

  // Calculate balance for each month
  expenseData.forEach((expense) => {
    const amount = expense.amount||0;
    const startDate = DateTime.fromISO(expense.startDate).startOf('month');
    const key = startDate.toFormat('yyyy-MM');
    amountsMap.set(key, amountsMap.get(key) - amount);
  });

  revenueData.forEach((revenue) => {
    const amount = revenue.amount||0;
    const startDate = DateTime.fromISO(revenue.startDate).startOf('month');
    const key = startDate.toFormat('yyyy-MM');
    amountsMap.set(key, amountsMap.get(key) + amount);
  });

  // Generate the balance sheet array
  amountsMap.forEach((amount, key) => {
    balanceSheet.push({
      amount,
      startDate: DateTime.fromFormat(key, 'yyyy-MM').toISO(),
    });
  });

  // Sort the balance sheet by startDate
  balanceSheet.sort((a, b) => {
    return DateTime.fromISO(a.startDate) - DateTime.fromISO(b.startDate);
  });

  // Create the final balance sheet object
  const balanceSheetObj = {
    balance: balanceSheet,
  };

  // Output the balance sheet as JSON
  console.log(JSON.stringify(balanceSheetObj, null, 2));
}

function getStartDate(revenueData, expenseData) {
  const startDates = [
    ...revenueData.map((revenue) => DateTime.fromISO(revenue.startDate).startOf('month')),
    ...expenseData.map((expense) => DateTime.fromISO(expense.startDate).startOf('month')),
  ];
  return startDates.reduce((minDate, currentDate) => {
    return currentDate < minDate ? currentDate : minDate;
  });
}

function getEndDate(revenueData, expenseData) {
  const endDates = [
    ...revenueData.map((revenue) => DateTime.fromISO(revenue.startDate).startOf('month')),
    ...expenseData.map((expense) => DateTime.fromISO(expense.startDate).startOf('month')),
  ];
  return endDates.reduce((maxDate, currentDate) => {
    return currentDate > maxDate ? currentDate : maxDate;
  });
}

// Testing Code
generateBalanceSheet('1-input.json');
generateBalanceSheet('2-input.json');
