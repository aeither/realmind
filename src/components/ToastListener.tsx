import { useToast } from "@/hooks/use-toast";
import { useQuery } from "convex/react";
import { useEffect, useRef } from "react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

interface ToastListenerProps {
  userId?: string;
}

export const ToastListener = ({ userId }: ToastListenerProps) => {
  const notifications = useQuery(api.notifications.getRecentNotifications, { userId });
  const processedIds = useRef(new Set<Id<"notifications">>());
  const { toast } = useToast();

  useEffect(() => {
    if (!notifications) return;

    for (const notification of notifications) {
      // Only show toast if we haven't processed this notification yet
      if (!processedIds.current.has(notification._id)) {
        processedIds.current.add(notification._id);
        
        const message = `${notification.message} (from ${notification.triggeredBy})`;
        
        switch (notification.type) {
          case "success":
            toast({
              title: "Success! 🎉",
              description: message,
            });
            break;
          case "error":
            toast({
              title: "Error! ❌",
              description: message,
              variant: "destructive",
            });
            break;
          case "info":
            toast({
              title: "Info ℹ️",
              description: message,
            });
            break;
          case "warning":
            toast({
              title: "Warning ⚠️",
              description: message,
            });
            break;
        }
      }
    }

    // Clean up old processed IDs to prevent memory leaks
    if (processedIds.current.size > 100) {
      const currentIds = new Set(notifications.map(n => n._id));
      processedIds.current = new Set([...processedIds.current].filter(id => currentIds.has(id)));
    }
  }, [notifications, toast]);

  return null;
}; 