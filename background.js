const openTabToActiveGroup = async () => {
  const [activeTab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  const activeGroupId = activeTab.groupId;

  const activeGroupTabs = await chrome.tabs.query({ groupId: activeGroupId });
  const lastActiveGroupTabIndex = Math.max(...activeGroupTabs.map((tab) => tab.index));

  const newTab = await chrome.tabs.create({
    index: lastActiveGroupTabIndex + 1
  });

  chrome.tabs.group({
    groupId: activeGroupId,
    tabIds: [newTab.id]
  });
}

chrome.commands.onCommand.addListener((command) => {
  if (command === "new-tab-to-group") {
    openTabToActiveGroup();
  }
});