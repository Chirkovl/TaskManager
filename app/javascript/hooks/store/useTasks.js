import { useSelector } from 'react-redux';
import { useTasksActions } from 'slices/TasksSlice';
import { STATES } from 'presenters/TaskPresenter';

const useTasks = () => {
  const board = useSelector((state) => state.TasksSlice.board);
  const { loadColumn, loadColumnMore, changeTaskState, loadTask, createTask, updateTask, destroyTask } =
    useTasksActions();
  const loadBoard = () => Promise.all(STATES.map(({ key }) => loadColumn(key)));

  return {
    board,
    loadBoard,
    loadColumn,
    loadColumnMore,
    changeTaskState,
    loadTask,
    createTask,
    updateTask,
    destroyTask,
  };
};

export default useTasks;
