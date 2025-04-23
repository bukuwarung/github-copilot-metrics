import { featuresEnvConfig } from "@/services/env-service";
import { format, startOfWeek, parse, isValid } from "date-fns";
import { CopilotMetrics, CopilotUsageOutput, Breakdown } from "@/features/common/models";

export const applyTimeFrameLabel = (
  data: CopilotMetrics[]
): CopilotUsageOutput[] => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return [];
  }

  // Sort data by date
  const sortedData = data.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const dataWithTimeFrame: CopilotUsageOutput[] = [];

  sortedData.forEach((item) => {
    try {
      // Convert date to a Date object and find the start of its week
      const date = new Date(item.date);
      const weekStart = startOfWeek(date, { weekStartsOn: 1 });

      // Create unique identifiers
      const weekIdentifier = format(weekStart, "MMM dd");
      const monthIdentifier = format(date, "MMM yy");

      // Create a breakdown array
      let breakdowns: Breakdown[] = [];

      // Process code completions data - safely handle missing properties
      if (item.copilot_ide_code_completions && item.copilot_ide_code_completions.editors) {
        item.copilot_ide_code_completions.editors.forEach((editor) => {
          if (editor && editor.models) {
            editor.models.forEach((model) => {
              if (model && model.languages) {
                model.languages.forEach((language) => {
                  breakdowns.push({
                    editor: editor.name.toLowerCase(),
                    model: model.name,
                    language: language.name,
                    suggestions_count: language.total_code_suggestions || 0,
                    acceptances_count: language.total_code_acceptances || 0,
                    lines_suggested: language.total_code_lines_suggested || 0,
                    lines_accepted: language.total_code_lines_accepted || 0,
                    active_users: language.total_engaged_users || 0
                  } as Breakdown);
                });
              }
            });
          }
        });
      }

      // Calculate code completion metrics
      let total_code_suggestions = 0;
      let total_code_acceptances = 0;
      let total_code_lines_suggested = 0;
      let total_code_lines_accepted = 0;
      
      if (item.copilot_ide_code_completions && item.copilot_ide_code_completions.editors) {
        item.copilot_ide_code_completions.editors.forEach(editor => {
          if (editor && editor.models) {
            editor.models.forEach(model => {
              if (model && model.languages) {
                model.languages.forEach(lang => {
                  total_code_suggestions += lang.total_code_suggestions || 0;
                  total_code_acceptances += lang.total_code_acceptances || 0;
                  total_code_lines_suggested += lang.total_code_lines_suggested || 0;
                  total_code_lines_accepted += lang.total_code_lines_accepted || 0;
                });
              }
            });
          }
        });
      }

      // Calculate chat metrics
      let total_chats = 0;
      let total_chat_insertion_events = 0;
      let total_chat_copy_events = 0;
      let total_chat_engaged_users = 0;
      
      if (item.copilot_ide_chat) {
        total_chat_engaged_users = item.copilot_ide_chat.total_engaged_users || 0;
        
        if (item.copilot_ide_chat.editors) {
          item.copilot_ide_chat.editors.forEach(editor => {
            if (editor && editor.models) {
              editor.models.forEach(model => {
                total_chats += model.total_chats || 0;
                total_chat_insertion_events += model.total_chat_insertion_events || 0;
                total_chat_copy_events += model.total_chat_copy_events || 0;
              });
            }
          });
        }
      }

      // Add dotcom chat metrics if they exist
      if (item.copilot_dotcom_chat && item.copilot_dotcom_chat.models) {
        item.copilot_dotcom_chat.models.forEach(model => {
          total_chats += model.total_chats || 0;
        });
        
        // Sometimes the total_engaged_users is directly on copilot_dotcom_chat
        if (item.copilot_dotcom_chat.total_engaged_users) {
          total_chat_engaged_users += item.copilot_dotcom_chat.total_engaged_users;
        }
      }

      // Create the transformed output object
      const output: CopilotUsageOutput = {
        day: item.date,
        total_active_users: item.total_active_users || 0,
        total_engaged_users: item.total_engaged_users || 0,
        total_ide_engaged_users: item.copilot_ide_code_completions?.total_engaged_users || 0,
        total_code_suggestions,
        total_code_acceptances,
        total_code_lines_suggested,
        total_code_lines_accepted,
        total_chat_engaged_users,
        total_chats,
        total_chat_insertion_events,
        total_chat_copy_events,
        breakdown: breakdowns,
        time_frame_week: weekIdentifier,
        time_frame_month: monthIdentifier,
        time_frame_display: weekIdentifier,
      };
      
      dataWithTimeFrame.push(output);
    } catch (error) {
      console.error("Error processing data item:", error, item);
    }
  });

  return dataWithTimeFrame;
};

export const getFeatures = () => {
  const features = featuresEnvConfig();
  if (features.status !== "OK") {
    return {
      dashboard: true,
      seats: true
    }
  }
  return features.response;
}

export const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

export const parseDate = (dateStr: string | null) => {
  if (!dateStr) return null;
  const parsed = parse(dateStr, 'yyyy-MM-dd', new Date());
  return isValid(parsed) ? parsed : null;
};

export const stringIsNullOrEmpty = (str: string | null | undefined) => {
  return str === null || str === undefined || str === "";
};

export const getNextUrlFromLinkHeader = (linkHeader: string | null): string | null => {
  if (!linkHeader) return null;

  const links = linkHeader.split(',');
  for (const link of links) {
    const match = link.match(/<([^>]+)>;\s*rel="([^"]+)"/);
    if (match && match[2] === 'next') {
      return match[1];
    }
  }
  return null;
}