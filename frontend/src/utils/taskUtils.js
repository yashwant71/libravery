import { getTasksService } from "../services/taskServices";
import { setLoading, setError } from "../store/reducers/uiState";
import { setTasksAction } from "../store/reducers/task";

export const fetchTasks = async ({
  dispatch,
  // setTasksAction,
  params = {},
  // setLoading,
  // setError,
}) => {
  setLoading && dispatch(setLoading(true));
  try {
    const data = await getTasksService(params); // Pass params to the API call
    if (Array.isArray(data)) {
      dispatch(setTasksAction(data)); // Dispatch to Redux
    } else {
      console.error("Data fetched is not an array:", data);
    }
  } catch (err) {
    setError && setError(err.message || "Error fetching tasks.");
  } finally {
    setLoading && dispatch(setLoading(false));
  }
};
