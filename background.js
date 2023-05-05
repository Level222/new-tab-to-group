"use strict";

const getActiveTab = async () => (await chrome.tabs.query({ active: true, lastFocusedWindow: true }))[0];

class OpenedTab {
  #tabId;
  #lastFocusedTabId;

  constructor(tabId, lastFocusedTabId) {
    this.#tabId = tabId;
    this.#lastFocusedTabId = lastFocusedTabId;

    chrome.tabs.onActivated.addListener(this.#handleActivate);
    chrome.tabs.onRemoved.addListener(this.#handleRemove);
  }

  #clearListeners() {
    chrome.tabs.onActivated.removeListener(this.#handleActivate);
    chrome.tabs.onRemoved.removeListener(this.#handleRemove);
  }

  #handleActivate = () => {
    this.#clearListeners();
  };

  #handleRemove = (tabId) => {
    if (tabId === this.#tabId) {
      chrome.tabs.update(this.#lastFocusedTabId, { active: true });
    }

    this.#clearListeners();
  }

  static async createToGroup(groupId) {
    const groupTabs = await chrome.tabs.query({ groupId });
    const groupEndTabIndex = Math.max(...groupTabs.map((tab) => tab.index));

    const lastFocusedTab = await getActiveTab();

    const newTab = await chrome.tabs.create({ index: groupEndTabIndex + 1 });
    const newTabId = newTab.id;

    if (groupId !== -1) {
      await chrome.tabs.group({
        groupId,
        tabIds: [newTabId]
      });
    }

    return new OpenedTab(newTabId, lastFocusedTab.id);
  }
}

const openTabToActiveGroup = async () => {
  const activeTab = await getActiveTab();
  const activeGroupId = activeTab.groupId;

  return await OpenedTab.createToGroup(activeGroupId);
};

chrome.commands.onCommand.addListener((command) => {
  if (command === "new-tab-to-group") {
    openTabToActiveGroup();
  }
});
