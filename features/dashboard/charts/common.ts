import { Breakdown, CopilotUsageOutput } from "@/features/common/models";
import { PieChartData } from "./language";

export interface AcceptanceRateData {
  acceptanceRate: number;
  acceptanceLinesRate: number;
  timeFrameDisplay: string;
}

export const computeAcceptanceAverage = (
  filteredData: CopilotUsageOutput[]
): AcceptanceRateData[] => {
  // Return empty array if data is invalid
  if (!filteredData || !Array.isArray(filteredData) || filteredData.length === 0) {
    return [];
  }

  const rates = filteredData.map((item) => {
    let cumulatedAccepted = 0;
    let cumulatedSuggested = 0;

    // Ensure breakdown exists and is an array
    if (item.breakdown && Array.isArray(item.breakdown)) {
      item.breakdown.forEach((breakdown: Breakdown) => {
        const acceptances_count = breakdown.acceptances_count || 0;
        const suggestions_count = breakdown.suggestions_count || 0;
        cumulatedAccepted += acceptances_count;
        cumulatedSuggested += suggestions_count;
      });
    }

    const acceptanceAverage =
    cumulatedSuggested !== 0
      ? (cumulatedAccepted / cumulatedSuggested) * 100
      : 0;
    
    let cumulatedLinesAccepted = 0;
    let cumulatedLinesSuggested = 0;

    // Ensure breakdown exists and is an array
    if (item.breakdown && Array.isArray(item.breakdown)) {
      item.breakdown.forEach((breakdown: Breakdown) => {
        const lines_accepted = breakdown.lines_accepted || 0;
        const lines_suggested = breakdown.lines_suggested || 0;
        cumulatedLinesAccepted += lines_accepted;
        cumulatedLinesSuggested += lines_suggested;
      });
    }

    const acceptanceLinesAverage =
      cumulatedLinesSuggested !== 0
        ? (cumulatedLinesAccepted / cumulatedLinesSuggested) * 100
        : 0;

    return {
      acceptanceRate: parseFloat(acceptanceAverage.toFixed(2)),
      acceptanceLinesRate: parseFloat(acceptanceLinesAverage.toFixed(2)),
      timeFrameDisplay: item.time_frame_display || 'Unknown',
    };
  });

  return rates;
};

export interface ActiveUserData {
  totalUsers: number;
  totalChatUsers: number;
  timeFrameDisplay: string;
}

export function getActiveUsers(
  filteredData: CopilotUsageOutput[]
): ActiveUserData[] {
  // Return empty array if data is invalid
  if (!filteredData || !Array.isArray(filteredData) || filteredData.length === 0) {
    return [];
  }

  const rates = filteredData.map((item) => {
    return {
      totalUsers: item.total_active_users || 0,
      totalChatUsers: item.total_chat_engaged_users || 0,
      timeFrameDisplay: item.time_frame_display || 'Unknown',
    };
  });

  return rates;
}

export const computeEditorData = (
  filteredData: CopilotUsageOutput[]
): Array<PieChartData> => {
  // Return empty array if data is invalid
  if (!filteredData || !Array.isArray(filteredData) || filteredData.length === 0) {
    return [];
  }

  const editorMap = new Map<string, PieChartData>();

  // Aggregate data
  filteredData.forEach(({ breakdown }) => {
    // Check if breakdown exists and is an array
    if (breakdown && Array.isArray(breakdown)) {
      breakdown.forEach(({ editor, active_users }) => {
        // Skip invalid entries
        if (!editor) return;
        
        const editorData = editorMap.get(editor) || {
          id: editor,
          name: editor,
          value: 0,
          fill: "",
        };
        editorData.value += active_users || 0;
        editorMap.set(editor, editorData);
      });
    }
  });

  // Convert Map to Array and calculate percentages
  let totalSum = 0;
  const editors = Array.from(editorMap.values()).map((editor) => {
    totalSum += editor.value;
    return editor;
  });

  // Avoid division by zero
  if (totalSum === 0) {
    return [];
  }

  // Calculate percentage values
  editors.forEach((editor) => {
    editor.value = Number(((editor.value / totalSum) * 100).toFixed(2));
  });

  // Sort by value
  editors.sort((a, b) => b.value - a.value);

  // Assign colors
  editors.forEach((editor, index) => {
    editor.fill = `hsl(var(--chart-${index < 4 ? index + 1 : 5}))`;
  });

  return editors;
};

export const computeLanguageData = (
  filteredData: CopilotUsageOutput[]
): Array<PieChartData> => {
  // Return empty array if data is invalid
  if (!filteredData || !Array.isArray(filteredData) || filteredData.length === 0) {
    return [];
  }

  const languageMap = new Map<string, PieChartData>();

  // Aggregate data
  filteredData.forEach(({ breakdown }) => {
    // Check if breakdown exists and is an array
    if (breakdown && Array.isArray(breakdown)) {
      breakdown.forEach(({ language, active_users }) => {
        // Skip invalid entries
        if (!language) return;
        
        const languageData = languageMap.get(language) || {
          id: language,
          name: language,
          value: 0,
          fill: "",
        };
        languageData.value += active_users || 0;
        languageMap.set(language, languageData);
      });
    }
  });

  // Convert Map to Array and calculate percentages
  let totalSum = 0;
  const languages = Array.from(languageMap.values()).map((language) => {
    totalSum += language.value;
    return language;
  });

  // Avoid division by zero
  if (totalSum === 0) {
    return [];
  }

  // Calculate percentage values
  languages.forEach((language) => {
    language.value = Number(((language.value / totalSum) * 100).toFixed(2));
  });

  // Sort by value
  languages.sort((a, b) => b.value - a.value);

  // Assign colors
  languages.forEach((language, index) => {
    language.fill = `hsl(var(--chart-${index < 4 ? index + 1 : 5}))`;
  });

  return languages;
};

export const computeActiveUserAverage = (
  filteredData: CopilotUsageOutput[]
) => {
  // Return 0 if data is invalid
  if (!filteredData || !Array.isArray(filteredData) || filteredData.length === 0) {
    return 0;
  }

  const activeUsersSum: number = filteredData.reduce(
    (sum: number, item: CopilotUsageOutput) =>
      sum + (item.total_active_users || 0),
    0
  );

  const averageActiveUsers = activeUsersSum / filteredData.length;
  return averageActiveUsers;
};

export const computeAdoptionRate = (seatManagement: any) => {
  // Return 0 if seat management data is invalid
  if (!seatManagement || !seatManagement.seat_breakdown) {
    return 0;
  }
  
  const active = seatManagement.seat_breakdown.active_this_cycle || 0;
  const total = seatManagement.seat_breakdown.total || 0;
  
  // Avoid division by zero
  const adoptionRate = total !== 0 ? (active / total) * 100 : 0;
  return adoptionRate;
};

export const computeCumulativeAcceptanceAverage = (
  filteredData: CopilotUsageOutput[]
) => {
  // Return 0 if data is invalid
  if (!filteredData || !Array.isArray(filteredData) || filteredData.length === 0) {
    return 0;
  }

  const acceptanceAverages = computeAcceptanceAverage(filteredData);
  const acceptanceChatAverages = computeChatAcceptanceAverage(filteredData);

  // Return 0 if either array is empty
  if (acceptanceAverages.length === 0 || acceptanceChatAverages.length === 0) {
    return 0;
  }

  const totalAcceptanceRate = acceptanceAverages.reduce(
    (sum, rate) => sum + rate.acceptanceLinesRate,
    0
  );

  const totalChatAcceptanceRate = acceptanceChatAverages.reduce(
    (sum, rate) => sum + rate.acceptanceChatRate,
    0
  ); 

  const comulativeAcceptanceRate = totalAcceptanceRate / acceptanceAverages.length;
  const comulativeChatAcceptanceRate = totalChatAcceptanceRate / acceptanceChatAverages.length;

  return (comulativeAcceptanceRate + comulativeChatAcceptanceRate) / 2;
};

export interface LineSuggestionsAndAcceptancesData {
  totalLinesAccepted: number;
  totalLinesSuggested: number;
  timeFrameDisplay: string;
}

export function totalLinesSuggestedAndAccepted(
  filteredData: CopilotUsageOutput[]
): LineSuggestionsAndAcceptancesData[] {
  // Return empty array if data is invalid
  if (!filteredData || !Array.isArray(filteredData) || filteredData.length === 0) {
    return [];
  }
  
  const codeLineSuggestionsAndAcceptances = filteredData.map((item) => {
    let total_lines_accepted = 0;
    let total_lines_suggested = 0;

    // Ensure breakdown exists and is an array
    if (item.breakdown && Array.isArray(item.breakdown)) {
      item.breakdown.forEach((breakdown) => {
        // Use safe access with defaults for missing values
        total_lines_accepted += breakdown.lines_accepted || 0;
        total_lines_suggested += breakdown.lines_suggested || 0;
      });
    }

    return {
      totalLinesAccepted: total_lines_accepted,
      totalLinesSuggested: total_lines_suggested,
      timeFrameDisplay: item.time_frame_display || 'Unknown',
    };
  });

  return codeLineSuggestionsAndAcceptances;
}

export interface SuggestionAcceptanceData {
  totalAcceptancesCount: number;
  totalSuggestionsCount: number;
  timeFrameDisplay: string;
}

export function totalSuggestionsAndAcceptances(
  filteredData: CopilotUsageOutput[]
): SuggestionAcceptanceData[] {
  // Return empty array if data is invalid
  if (!filteredData || !Array.isArray(filteredData) || filteredData.length === 0) {
    return [];
  }

  const rates = filteredData.map((item) => {
    let totalAcceptancesCount = 0;
    let totalSuggestionsCount = 0;

    // Ensure breakdown exists and is an array
    if (item.breakdown && Array.isArray(item.breakdown)) {
      item.breakdown.forEach((breakdown) => {
        totalAcceptancesCount += breakdown.acceptances_count || 0;
        totalSuggestionsCount += breakdown.suggestions_count || 0;
      });
    }

    return {
      totalAcceptancesCount,
      totalSuggestionsCount,
      timeFrameDisplay: item.time_frame_display || 'Unknown',
    };
  });

  return rates;
}

export interface ChatAcceptanceRateData {
  acceptanceChatRate: number;
  timeFrameDisplay: string;
}

export const computeChatAcceptanceAverage = (
  filteredData: CopilotUsageOutput[]
): ChatAcceptanceRateData[] => {
  // Return empty array if data is invalid
  if (!filteredData || !Array.isArray(filteredData) || filteredData.length === 0) {
    return [];
  }

  const rates = filteredData.map((item) => {
    // Add safe default values
    const totalChats = item.total_chats || 0;
    const totalChatInsertionEvents = item.total_chat_insertion_events || 0;
    const totalChatCopyEvents = item.total_chat_copy_events || 0;

    // Calculate the acceptance rate but cap it at 100%
    let acceptanceRate = 0;
    if (totalChats !== 0) {
      // Calculate raw rate
      const rawRate = ((totalChatInsertionEvents + totalChatCopyEvents) / totalChats) * 100;
      // Cap the rate at 100%
      acceptanceRate = Math.min(rawRate, 100);
    }

    return {
      acceptanceChatRate: parseFloat(acceptanceRate.toFixed(2)),
      timeFrameDisplay: item.time_frame_display || 'Unknown'
    };
  });

  return rates;
};

export interface ChatAcceptanceData {
  totalChats: number;
  totalChatInsertionEvents: number;
  totalChatCopyEvents: number;
  timeFrameDisplay: string;
}

export function totalChatsAndAcceptances(
  filteredData: CopilotUsageOutput[]
): ChatAcceptanceData[] {
  // Return empty array if data is invalid
  if (!filteredData || !Array.isArray(filteredData) || filteredData.length === 0) {
    return [];
  }

  const rates = filteredData.map((item) => {
    return {
      totalChats: item.total_chats || 0,
      totalChatInsertionEvents: item.total_chat_insertion_events || 0,
      totalChatCopyEvents: item.total_chat_copy_events || 0,
      timeFrameDisplay: item.time_frame_display || 'Unknown'
    };
  });

  return rates;
}
