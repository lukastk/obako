<script lang="ts">
	import { getTasks } from "src/task-utils";
	import type { ObakoTask } from "src/task-utils";
	import TaskList from "./TaskList.svelte";
	import Collapsible from "./Collapsible.svelte";

	export let title: string;
	export let filter_func: (task: any) => boolean = () => true;
	export let isCollapsed: boolean = false;
	export let secondLevel: boolean = false;
	
	let tasks: ObakoTask[] = getTasks().filter(filter_func);
	$: hasNoItems = tasks.length == 0;
</script>

<Collapsible
	{title}
	isCollapsed={isCollapsed || hasNoItems}
	reloadButton={false}
	disabled={hasNoItems}
	{secondLevel}
>
	<TaskList {filter_func} />
</Collapsible>
