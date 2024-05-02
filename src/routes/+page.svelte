<script>
	export let data;
	console.log(data)
</script>
<div id ='wrapper'>

	<h1>d360 viewer</h1>
	<p>
		Welcome to the d360 viewer! This is meant as a tool to enable designers to quickly and easily view and annotate 360° videos. It's an ongoing project that is poorly document and being done by one guy who is not really a programmer, sorry about that in advance :0!
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
</style>
