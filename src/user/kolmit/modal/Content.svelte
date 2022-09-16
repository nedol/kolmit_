

<script>
    import { onDestroy, onMount } from 'svelte';
    import { createEventDispatcher } from 'svelte'
    import { getContext } from 'svelte';
	import Profile from './Profile.svelte';
    const dispatch =  createEventDispatcher()

    const { open } = getContext('simple-modal');

    onMount(()=>{
        console.log() ;
    })


    const onCancel = (text) => {

	}
	
	const onOkay = (text) => {

	}

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




    onDestroy();
  
 



</script>

