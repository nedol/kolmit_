<script>
    export let display = 'none;'
</script>
<div style="display:{display}; position:absolute;left:0;top:0;width:auto;height:200px">
<slot name='local'></slot>
<slot name='remote'></slot>
</div>