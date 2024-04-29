

<script>
	/** @type {import('./$types').PageData} */
	export let data;
    let title = "test page"

    const link = `https://d360-viewer.netlify.app/?annoID=${data.annotation.id}`


</script>
<svelte:head>
	<title>{data.annotation.text}</title>
    <meta property="og:title" content={data.annotation.text} />
    <meta property="og:type" content="video.movie" />
    <meta property="og:url" content={link} />
    <meta property="og:image" content={data.annotation.imgurl} />

</svelte:head>

<div class = "wrapper">

    <div class = "header">
        <h1>{data.annotation.text}</h1>
        <a href={link}> view the video</a>
    </div>
    <img src={data.annotation.imgurl} alt={data.annotation.text} />
    <!-- <img src={data.annotation.equarecimg} alt={data.annotation.text} />  -->
</div>

<style>

    img {
        display: block;
    }
    .wrapper {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin: 40px;
    }

    .header {
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
</style>