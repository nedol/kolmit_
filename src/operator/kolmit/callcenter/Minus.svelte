<div on:click={OnRemoveOper} style="display: block;">
    <slot></slot>
</div>

<script>
    import _  from 'lodash';

    function OnRemoveOper(ev){
      let attr =  ev.target.attributes['email'];      
    //   var evens = _.remove(users, function(n) {
    //     return n.email = attr.value;
    //   });
      console.log(users);
    }

</script>