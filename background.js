const openTabToGroup = async (groupId) => {
  const groupTabs = await chrome.tabs.query({ groupId });
  const groupEndTabIndex = Math.max(...groupTabs.map((tab) => tab.index));

  const newTab = await chrome.tabs.create({ index: groupEndTabIndex + 1 });

  await chrome.tabs.group({
    groupId,
    tabIds: [newTab.id]
  });

  return newTab;
};

const openTabToActiveGroup = async () => {
  const [activeTab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  const activeGroupId = activeTab.groupId;

  return await openTabToGroup(activeGroupId);
};

chrome.commands.onCommand.addListener((command) => {
  if (command === "new-tab-to-group") {
    openTabToActiveGroup();
  }
});