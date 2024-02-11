<script lang="ts">
	import axios from "axios";


interface animal {
    name: string,
    emoji: string;
}

	let item1: animal | undefined;
	let item2: animal | undefined;

	let animals : animal[] = [
		{ name: 'pug', emoji: '🐶' },
		{ name: 'cat', emoji: '🐱' },
		{ name: 'butterfly', emoji: '🦋' },
		{ name: 'chicken', emoji: '🐔' },
		{ name: 'duck', emoji: '🦆' }
	];

    async function handleClick(a : animal) {

        if(a == item1){
            item1 = undefined;
            return;
        }

        if(!item1) {
            item1 = a;
        }
        else if(!item2) {
            item2 = a;
            const newanimal = await axios.post('/combine', { item1, item2 });
            item1 = undefined;
            item2 = undefined;
            animals.push(newanimal.data);
        }
    }
</script>

<div class="flex w-screen h-screen justify-center items-center flex-col">
	{#each animals as a}
		<button
        on:click={() => handleClick(a)}
        class:selected={item1?.name == a.name || item2?.name == a.name}
         class="m-2 p-2 bg-blue-500 text-white rounded-lg">
			{a.emoji}
			{a.name}
		</button>
	{/each}
</div>

<!-- markup (zero or more items) goes here -->

<style lang="postcss">
	@tailwind base;
	@tailwind components;
	@tailwind utilities;

    .selected {
        @apply bg-red-500;
    }
</style>
