import React, { useEffect, useState } from 'react';
import KanbanBoard from '@lourenci/react-kanban';
import '@lourenci/react-kanban/dist/styles.css';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';

import Task from 'components/Task';
import AddPopup from 'components/AddPopup';
import EditPopup from 'components/EditPopup';
import ColumnHeader from 'components/ColumnHeader';
import TaskForm from 'forms/TaskForm';

import TaskPresenter from 'presenters/TaskPresenter';

import useTasks from 'hooks/store/useTasks';

import useStyles from './useStyles';

const MODES = {
  ADD: 'add',
  EDIT: 'edit',
  NONE: 'none',
};

const TaskBoard = function () {
  const { board, loadBoard, loadColumnMore, changeTaskState, loadTask, createTask, updateTask, destroyTask } =
    useTasks();
  const [mode, setMode] = useState(MODES.NONE);
  const [openedTaskId, setOpenedTaskId] = useState(null);
  const styles = useStyles();

  useEffect(() => {
    loadBoard();
  }, []);

  const handleOpenAddPopup = () => {
    setMode(MODES.ADD);
  };

  const handleOpenEditPopup = (task) => {
    setOpenedTaskId(TaskPresenter.id(task));
    setMode(MODES.EDIT);
  };

  const handleClose = () => {
    setMode(MODES.NONE);
    setOpenedTaskId(null);
  };

  const handleColumnMore = (state, page = 1, perPage = 10) => {
    loadColumnMore(state, page, perPage);
  };

  const handleCardDragEnd = (task, source, destination) => changeTaskState(task, source, destination);

  const handleTaskCreate = (params) => {
    const attributes = TaskForm.attributesToSubmit(params);
    return createTask(attributes).then(() => handleClose());
  };
  const handleTaskLoad = (id) => loadTask(id);

  const handleTaskUpdate = (task) => {
    const attributes = TaskForm.attributesToSubmit(task);
    return updateTask(task, attributes).then(() => handleClose());
  };

  const handleTaskDestroy = (task) => destroyTask(task).then(() => handleClose());

  return (
    <>
      <Fab onClick={handleOpenAddPopup} className={styles.addButton} color="primary" aria-label="add">
        <AddIcon />
      </Fab>

      <KanbanBoard
        disableColumnDrag
        onCardDragEnd={handleCardDragEnd}
        renderCard={(card) => <Task onClick={handleOpenEditPopup} task={card} />}
        renderColumnHeader={(column) => <ColumnHeader column={column} onLoadMore={handleColumnMore} />}
      >
        {board}
      </KanbanBoard>

      {mode === MODES.ADD && <AddPopup onCreateCard={handleTaskCreate} onClose={handleClose} />}
      {mode === MODES.EDIT && (
        <EditPopup
          onCardLoad={handleTaskLoad}
          onCardDestroy={handleTaskDestroy}
          onCardUpdate={handleTaskUpdate}
          onClose={handleClose}
          cardId={openedTaskId}
        />
      )}
    </>
  );
};

export default TaskBoard;
