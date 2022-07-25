<!-- Content.svelte -->
  
<!-- <p><button on:click={showDialog}>Show me a surprise!</button></p> -->

<script>
    import { getContext } from 'svelte';
    import Dialog from './Dialog.svelte';
  
    const { open } = getContext('simple-modal');
  
    export const showDialog = () => {
		open(
			Dialog,
			{
				message: "Input password",
				hasForm: true,
				onCancel,
				onOkay
			},
			{
				closeButton: false,
				closeOnEsc: false,
				closeOnOuterClick: false,
			}
	  );
	};

	function onCancel(params) {
		
	}
	function onOkay(params) {
		
	}
  </script>
