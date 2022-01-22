import { propEq } from 'ramda';
import { createSlice } from '@reduxjs/toolkit';
import TasksRepository from 'repositories/TasksRepository';
import { STATES } from 'presenters/TaskPresenter';
import { useDispatch } from 'react-redux';
import { changeColumn } from '@asseinfo/react-kanban';

import TaskPresenter from 'presenters/TaskPresenter';

const initialState = {
  board: {
    columns: STATES.map((column) => ({
      id: column.key,
      title: column.value,
      cards: [],
      meta: {},
    })),
  },
};

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    loadColumnSuccess(state, { payload }) {
      const { items, meta, columnId } = payload;
      const column = state.board.columns.find(propEq('id', columnId));

      state.board = changeColumn(state.board, column, {
        cards: items,
        meta,
      });

      return state;
    },

    loadColumnSuccessMore(state, { payload }) {
      const { items, meta, columnId } = payload;
      const column = state.board.columns.find(propEq('id', columnId));
      state.board = changeColumn(state.board, column, {
        cards: [...column.cards, ...items],
        meta,
      });

      return state;
    },
  },
});

const { loadColumnSuccess, loadColumnSuccessMore } = tasksSlice.actions;

export default tasksSlice.reducer;

export const useTasksActions = () => {
  const dispatch = useDispatch();

  const loadColumn = (state, page = 1, perPage = 10) => {
    TasksRepository.index({
      q: { stateEq: state },
      page,
      perPage,
    }).then(({ data }) => {
      dispatch(loadColumnSuccess({ ...data, columnId: state }));
    });
  };

  const loadColumnMore = (state, page = 1, perPage = 10) => {
    TasksRepository.index({
      q: { stateEq: state },
      page,
      perPage,
    }).then(({ data }) => {
      dispatch(loadColumnSuccessMore({ ...data, columnId: state }));
    });
  };

  const changeTaskState = (task, source, destination) => {
    const transition = task.transitions.find(({ to }) => destination.toColumnId === to);

    if (!transition) {
      return null;
    }

    return TasksRepository.update(task.id, { stateEvent: transition.event })
      .then(() => {
        loadColumn(destination.toColumnId);
        loadColumn(source.fromColumnId);
      })
      .catch((error) => {
        alert(`Moves failed! ${error.message}`);
      });
  };

  const loadTask = (id) => TasksRepository.show(id).then(({ data: { task } }) => task);

  const createTask = (params) =>
    TasksRepository.create(params).then(({ data: { task } }) => {
      loadColumn(TaskPresenter.state(task));
    });

  const updateTask = (task, params) =>
    TasksRepository.update(TaskPresenter.id(task), params).then(() => {
      loadColumn(TaskPresenter.state(task));
    });

  const destroyTask = (task) =>
    TasksRepository.destroy(task.id).then(() => {
      loadColumn(TaskPresenter.state(task));
    });

  const loadBoard = () => STATES.map(({ key }) => loadColumn(key));

  return {
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
