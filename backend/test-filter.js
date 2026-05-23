const lists = [
  {
    id: 'list1',
    title: 'To Do',
    cards: [
      { id: 'c1', title: 'Task 1', isCompleted: false, dueDate: null, labels: [] },
      { id: 'c2', title: 'Task 2', isCompleted: true, dueDate: new Date().toISOString(), labels: [{ label: { color: 'BLUE' } }] },
      { id: 'c3', title: 'Task 3', isCompleted: false, dueDate: new Date(Date.now() - 100000000).toISOString(), labels: [{ label: { color: 'RED' } }] }
    ]
  }
];

const filterKeyword = '';
const filterLabelColors = ['BLUE'];
const filterMemberIds = [];
const filterDueDate = false;
const filterNoMembers = false;
const filterNoDates = false;
const filterOverdue = false;
const filterDueNextDay = false;
const filterDueNextWeek = false;
const filterDueNextMonth = false;
const filterMarkedComplete = false;
const filterNotMarkedComplete = false;

const filteredListsData = lists.map(list => {
  const filteredCards = list.cards.filter(c => {
    if (filterKeyword && !c.title.toLowerCase().includes(filterKeyword.toLowerCase())) return false;
    if (filterLabelColors.length > 0 && !c.labels?.some(l => filterLabelColors.includes(l.label?.color))) return false;
    
    // Membership filters
    if (filterMemberIds.length > 0 && filterNoMembers) {
      if (c.members?.length > 0 && !c.members?.some(m => filterMemberIds.includes(m.userId))) return false;
    } else if (filterMemberIds.length > 0) {
      if (!c.members?.some(m => filterMemberIds.includes(m.userId))) return false;
    } else if (filterNoMembers) {
      if (c.members?.length > 0) return false;
    }

    // Completion status filters
    if (filterMarkedComplete && filterNotMarkedComplete) {
      // do nothing
    } else if (filterMarkedComplete) {
      if (!c.isCompleted) return false;
    } else if (filterNotMarkedComplete) {
      if (c.isCompleted) return false;
    }

    // Date filters
    const hasDateFilter = filterDueDate || filterNoDates || filterOverdue || filterDueNextDay || filterDueNextWeek || filterDueNextMonth;
    
    if (hasDateFilter) {
      if (filterNoDates && !c.dueDate) return true;
      if (!c.dueDate) return false; // If there are other date filters, and card has no date, fail it (unless it passed no dates above)

      const now = new Date();
      const dueDate = new Date(c.dueDate);
      const timeDiff = dueDate.getTime() - now.getTime();
      const daysDiff = timeDiff / (1000 * 3600 * 24);

      const isOverdue = daysDiff < 0 && !c.isCompleted;
      const isNextDay = daysDiff >= 0 && daysDiff <= 1;
      const isNextWeek = daysDiff >= 0 && daysDiff <= 7;
      const isNextMonth = daysDiff >= 0 && daysDiff <= 30;

      let passDate = false;
      if (filterDueDate) passDate = true;
      if (filterOverdue && isOverdue) passDate = true;
      if (filterDueNextDay && isNextDay) passDate = true;
      if (filterDueNextWeek && isNextWeek) passDate = true;
      if (filterDueNextMonth && isNextMonth) passDate = true;

      if (!passDate) return false;
    }

    return true;
  });
  return { ...list, cards: filteredCards };
});

console.log(JSON.stringify(filteredListsData, null, 2));
