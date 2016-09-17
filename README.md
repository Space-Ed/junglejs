# Gentyl

## A structural synthesis engine.

The purpose of this tool is to provide a means of synthesizing and channeling structured data using a hierarchical state system. Supporting Reactive IO and Serialization of dynamically extensible Generator Objects.

---
### Basics

the fundamental unit is a G-node.

a G-node represents a generator object that can be resolved to produce objects.

G-nodes have 3 parts:

- Component:    the compositional structure of what is generated.
- Form:         the processes applied at each stage and description of state.
- Context:      the items of state modified by and informing the aforementioned processes.

each part is represented by an object argument

an example G-node used to generate cats with eventual exhaustion of names could look like this.
```javascript
g({
    size:34,
    ferocity:10,
    name:g({},
        {
            f:function(obj, args){
                return this.names.pop() || "puss"
            }
        },{
            names:["Ben", "Lucy", "Magnus","Tiger"]    //refers to here
        }
    )
    },{
    f:function(obj, args){
        return `a size ${obj.size} cat with ${obj.ferocity} called ${obj.name}`
    }
}).prepare();
```


```js
g.resolve()
-->
{   
    size:34,
    ferocity:10,
    name:'tiger'
}
```

then the same with name 'magnus'
and so on until the array is empty and the name changes to 'puss'

---

### Structure

G-nodes can contain other G-nodes;

```js

g({
    size:g({},),
    ferocity:10,
    name:undefined
},{

},{
    names:["Ben", "Lucy", "Magnus","Tiger"]    //refers to here
}).prepare();

```
