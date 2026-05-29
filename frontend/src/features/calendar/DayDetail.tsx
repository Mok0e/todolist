import { useEffect, useState } from "react";
import { parseISO, startOfDay, endOfDay, isSameDay } from "date-fns";
import { Check, Pencil, Trash2 } from "lucide-react";
import type { Todo, TodoStatus } from "@/types";

const STATUS_COLOR: Record<TodoStatus, string> = {
  DONE: "var(--text-tertiary)",
  IN_PROGRESS: "var(--text-secondary)",
  OVERDUE: "var(--color-red)",
  NOT_STARTED: "var(--text-tertiary)",
};

const STATUS_LABEL: Record<TodoStatus, string> = {
  DONE: "완료",
  IN_PROGRESS: "진행중",
  OVERDUE: "기한초과",
  NOT_STARTED: "시작전",
};

const DAY_NAMES = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];

function parseDateLabel(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return {
    month: d.getMonth() + 1,
    day: d.getDate(),
    dayName: DAY_NAMES[d.getDay()] ?? '',
  };
}

interface DayDetailProps {
  selectedDate: string | null;
  todos: Todo[];
  isOpen: boolean;
  onClose: () => void;
  isDesktop: boolean;
  onEditTodo: (todo: Todo) => void;
  onToggleComplete: (todo: Todo) => void;
  onDeleteTodo: (id: string) => void;
}

export function DayDetail({ selectedDate, todos, isOpen, onClose, isDesktop, onEditTodo, onToggleComplete, onDeleteTodo }: DayDetailProps) {
  const dayTodos = selectedDate
    ? todos.filter((todo) => {
        const start = todo.startDate ? startOfDay(parseISO(todo.startDate)) : startOfDay(parseISO(todo.endDate!));
        const end = endOfDay(parseISO(todo.endDate!));
        const target = startOfDay(parseISO(selectedDate));

        return (target >= start && target <= end) || isSameDay(target, start) || isSameDay(target, end);
      })
    : [];

  const dateLabel = selectedDate ? parseDateLabel(selectedDate) : null;

  useEffect(() => {
    if (!isDesktop && isOpen) {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
      };
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isDesktop, isOpen, onClose]);

  if (isDesktop) {
    if (!selectedDate) return null;
    return (
      <div
        data-testid="day-detail-panel"
        style={{
          background: "var(--bg-grouped)",
          borderRadius: "var(--radius-lg)",
          padding: "20px",
          minHeight: "200px",
        }}
      >
        <DayHeader dateLabel={dateLabel} count={dayTodos.length} />
        <TodoList todos={dayTodos} onEditTodo={onEditTodo} onToggleComplete={onToggleComplete} onDeleteTodo={onDeleteTodo} />
      </div>
    );
  }

  // Mobile: Bottom Sheet
  return (
    <>
      {isOpen && (
        <div
          data-testid="bottom-sheet-backdrop"
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            zIndex: 40,
          }}
        />
      )}
      <div
        data-testid="day-detail-sheet"
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          background: "var(--bg-grouped)",
          borderRadius: "var(--radius-xl) var(--radius-xl) 0 0",
          zIndex: 50,
          paddingBottom: "60px",
          transform: isOpen ? "translateY(0)" : "translateY(100%)",
          transition: "transform 400ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {/* Grabber handle */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "8px 0 4px",
          }}
        >
          <div
            style={{
              width: "36px",
              height: "4px",
              borderRadius: "var(--radius-full)",
              background: "var(--color-gray)",
              opacity: 0.4,
            }}
          />
        </div>

        <div style={{ padding: "12px 20px 20px" }}>
          <DayHeader dateLabel={dateLabel} count={dayTodos.length} />
          <TodoList todos={dayTodos} onEditTodo={onEditTodo} onToggleComplete={onToggleComplete} onDeleteTodo={onDeleteTodo} />
        </div>
      </div>
    </>
  );
}

function TodoList({
  todos,
  onEditTodo,
  onToggleComplete,
  onDeleteTodo,
}: {
  todos: Todo[];
  onEditTodo: (todo: Todo) => void;
  onToggleComplete: (todo: Todo) => void;
  onDeleteTodo: (id: string) => void;
}) {
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);

  if (todos.length === 0) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "8px",
          padding: "32px 0",
          color: "var(--text-secondary)",
          fontSize: "16px",
        }}
      >
        <span style={{ fontSize: "32px" }}>📅</span>이 날의 할 일이 없습니다.
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      {todos.map((todo) => (
        <div
          key={todo.id}
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "10px",
            padding: "12px 12px",
            background: "var(--bg-elevated)",
            borderRadius: "var(--radius-md)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          {/* 완료 토글 버튼 */}
          <button
            onClick={() => onToggleComplete(todo)}
            aria-label={todo.status === "DONE" ? "완료 취소" : "완료"}
            style={{
              width: "16px",
              height: "16px",
              borderRadius: "50%",
              border: todo.status === "DONE" ? "none" : "1.5px solid var(--separator-opaque)",
              background: todo.status === "DONE" ? "var(--check-green)" : "transparent",
              flexShrink: 0,
              marginTop: "1px",
              cursor: "pointer",
              padding: 0,
              minHeight: "unset",
              minWidth: "unset",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background 150ms ease, border-color 150ms ease",
            }}
          >
            {todo.status === "DONE" && <Check size={9} strokeWidth={2} color="white" />}
          </button>

          {/* 제목 + 상태·카테고리 */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: "14px",
                fontWeight: 500,
                lineHeight: "18px",
                color: todo.status === "DONE" ? "var(--text-tertiary)" : "var(--text-primary)",
                textDecoration: todo.status === "DONE" ? "line-through" : "none",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {todo.title}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "5px", marginTop: "3px" }}>
              <span style={{ fontSize: "11px", color: STATUS_COLOR[todo.status], fontWeight: 500 }}>{STATUS_LABEL[todo.status]}</span>
              {todo.category?.name && (
                <>
                  <span style={{ fontSize: "10px", color: "var(--text-quaternary)" }}>·</span>
                  <span style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>{todo.category.name}</span>
                </>
              )}
            </div>
          </div>

          {/* 수정·삭제 버튼 */}
          <div style={{ display: "flex", gap: "2px", flexShrink: 0 }}>
            <button
              onClick={() => onEditTodo(todo)}
              onMouseEnter={() => setHoveredButton(`edit-${todo.id}`)}
              onMouseLeave={() => setHoveredButton(null)}
              style={{
                background: "transparent",
                border: "none",
                color: hoveredButton === `edit-${todo.id}` ? "var(--text-secondary)" : "var(--text-quaternary)",
                cursor: "pointer",
                padding: "0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "24px",
                height: "24px",
                borderRadius: "var(--radius-sm)",
                transition: "color 150ms ease",
              }}
              aria-label="수정"
            >
              <Pencil size={13} />
            </button>
            <button
              onClick={() => onDeleteTodo(todo.id)}
              onMouseEnter={() => setHoveredButton(`delete-${todo.id}`)}
              onMouseLeave={() => setHoveredButton(null)}
              style={{
                background: "transparent",
                border: "none",
                color: hoveredButton === `delete-${todo.id}` ? "var(--color-red)" : "var(--text-quaternary)",
                cursor: "pointer",
                padding: "0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "24px",
                height: "24px",
                borderRadius: "var(--radius-sm)",
                transition: "color 150ms ease",
              }}
              aria-label="삭제"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function DayHeader({ dateLabel, count }: { dateLabel: { month: number; day: number; dayName: string } | null; count: number }) {
  if (!dateLabel) return null;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        marginBottom: "14px",
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
        <span style={{ fontSize: "17px", fontWeight: 700, color: "var(--text-primary)" }}>
          {dateLabel.month}월 {dateLabel.day}일
        </span>
        <span style={{ fontSize: "13px", fontWeight: 400, color: "var(--text-secondary)" }}>{dateLabel.dayName}</span>
      </div>
      {count > 0 && (
        <span
          style={{
            fontSize: "12px",
            fontWeight: 600,
            color: "var(--text-tertiary)",
            background: "var(--bg-tertiary)",
            padding: "2px 9px",
            borderRadius: "var(--radius-full)",
          }}
        >
          {count}
        </span>
      )}
    </div>
  );
}
