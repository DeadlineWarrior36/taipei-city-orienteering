import { useState } from "react";
import useSWR from "swr";

function useQuest({ id }: { id: string }) {
  const { data, error, isLoading } = useSWR("/api/quest");

  const [path, setPath] = useState([]);
	const [startedAt, setStartedAt] = useState('');
	
}
