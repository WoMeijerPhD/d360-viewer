<script>
	import {addViewer, getSessionsByUser} from '../lib/Supabase-functions.js';
	import {getUserId,newUserId} from '../lib/user-id.js';
	export let data;
	import { onMount } from 'svelte'

	let user_id = "no user ID set"
	let sessions = []
	onMount(async () => {
		user_id = await getUserId();
		sessions = await getSessionsByUser(user_id);
		// sor the session by id
		sessions.sort((a,b) => {
			return a.id - b.id;
		})
		
	})


	async function getNewUserId(){
		user_id = await newUserId();
	}


</script>
<div id ='wrapper'>

	<h1>D360 viewer</h1>
	<p>
		Welcome to the D360 viewer! This is meant as a tool to enable designers to quickly and easily view and annotate 360° videos. It's an ongoing project that is poorly document and being done by one guy who is not really a programmer, sorry about that in advance :0!
	</p>
	<p>What is working is the viewer, you can click on one of these videos below and it should show you the video and enable you to make annotations using the '+' button.</p>
	<p>These annotations get saved somewhere to a server, still need to make the user management and flow and all that work. But yeah, it will save your data. Sorry.</p>
	
	
	<div id="video-wrapper">
		<!-- iterate over data.videos -->
		{#each data.videos as video}
		<a href="./viewer/{video.id}/">
			<div class='video-item' id={video.id}> 
				<h2>{video.title}</h2>
			</div>
		</a>
		{/each}
	</div>

	<div id="user_managment">
		<h2>User Managment</h2>
		Hello user! You are user number: {user_id}

		<button on:click={newUserId} > get new user number</button>

		<h3>Sessions</h3>
		<table>
			<tr>
				<th>Session ID</th>
				<th>Video</th>
				<th>Num. annotations</th>
			</tr>
			{#each sessions as session}
			<tr>
				<td><a href="/viewer/{session.videos.id}?session_id={session.id}">{session.id}</a></td>
				<td>{session.videos.title}</td>
				<td>{session.annotations.length}</td>
			{/each}
		</table>
	</div>
	
</div>
<style>
	#wrapper{
		padding: 10px;
	}
	#video-wrapper {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-around;
	}
	.video-item {
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
		width: 25vw;
		min-width: 200px;
		height: 25vh;
		margin: 10px;
		padding: 5px;
		border: 1px solid black;
	}
	.video-item:hover {
		background-color: lightgray;
	}
	/* give the table padding */
	table {
		width: 100%;
	}
	table, th, td {
		border: 1px solid black;
		border-collapse: collapse;
	}
	th, td {
		padding: 5px;
	}

</style>
