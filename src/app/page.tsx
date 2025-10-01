"use client";
import { useState, useEffect, useMemo } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Todo } from "@/types";
import { TodoItem } from "@/components/TodoItem";
import styles from "@/styles/Todo.module.css";

type Filter = "all" | "active" | "completed";

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  // 1. コンポーネントマウント時にlocalStorageからTODOリストを読み込む
  useEffect(() => {
    setIsMounted(true);
    const storedTodos = localStorage.getItem("todos"); // ユーザーに依存しないキーに変更
    if (storedTodos) {
      setTodos(JSON.parse(storedTodos));
    }
  }, []);

  // 2. TODOリストが変更されたらlocalStorageに保存する
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("todos", JSON.stringify(todos)); // ユーザーに依存しないキーに変更
    }
  }, [todos, isMounted]);

  // 3. 未完了のTODO数を計算する (useMemo)
  const incompleteTodosCount = useMemo(() => {
    return todos.filter((todo) => !todo.completed).length;
  }, [todos]);

  // 4. フィルタリングされたTODOリストを作成する (useMemo)
  const filteredTodos = useMemo(() => {
    switch (filter) {
      case "active":
        return todos.filter((todo) => !todo.completed);
      case "completed":
        return todos.filter((todo) => todo.completed);
      default:
        return todos;
    }
  }, [todos, filter]);

  // 新しいTODOを追加
  const handleAddTodo = () => {
    if (newTodo.trim() !== "") {
      setTodos([
        ...todos,
        { id: crypto.randomUUID(), text: newTodo, completed: false },
      ]);
      setNewTodo("");
    }
  };

  // TODOの完了状態を切り替え
  const handleToggleTodo = (id: string) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  // TODOを削除
  const handleDeleteTodo = (id: string) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  // ドラッグ＆ドロップのセンサー設定
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // ドラッグ終了時の処理
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    // overがnullの場合や、同じアイテムの上にドロップされた場合は処理を中断
    if (!over || active.id === over.id) {
      return;
    }
    setTodos((items) => {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      // oldIndexとnewIndexが見つかった場合のみ並び替えを実行
      if (oldIndex !== -1 && newIndex !== -1) {
        return arrayMove(items, oldIndex, newIndex);
      }
      // 見つからなかった場合は元の配列を返す
      return items;
    });
  };

  if (!isMounted) {
    return null; // マウントされるまで何も表示しないことで、サーバーとクライアントの不一致を防ぐ
  }

  // TODOアプリ本体
  return (
    <main className={styles.container}>
      <div className={styles.todoAppContainer}>
        <h1 className={styles.title}>Vercelデプロイ演習</h1>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="新しいTODO"
            className={styles.input}
            onKeyDown={(e) => e.key === "Enter" && handleAddTodo()}
          />
          <button onClick={handleAddTodo} className={styles.button}>
            追加
          </button>
        </div>
        <div className={styles.header}>
          <span>未完了: {incompleteTodosCount}件</span>
          <div className={styles.filterButtons}>
            <button
              onClick={() => setFilter("all")}
              className={`${styles.filterButton} ${
                filter === "all" ? styles.active : ""
              }`}
            >
              すべて
            </button>
            <button
              onClick={() => setFilter("active")}
              className={`${styles.filterButton} ${
                filter === "active" ? styles.active : ""
              }`}
            >
              未完了
            </button>
            <button
              onClick={() => setFilter("completed")}
              className={`${styles.filterButton} ${
                filter === "completed" ? styles.active : ""
              }`}
            >
              完了済み
            </button>
          </div>
        </div>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={todos.map((todo) => todo.id)}
            strategy={verticalListSortingStrategy}
          >
            <ul className={styles.todoList}>
              {filteredTodos.map((todo) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onToggle={handleToggleTodo}
                  onDelete={handleDeleteTodo}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      </div>
    </main>
  );
}
