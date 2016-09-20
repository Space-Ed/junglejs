# Gentyl

## What is Structural Synthesis and what is it for?

The purpose of this tool is to provide a means of synthesizing and channeling structured data using a hierarchical state system. The system supports reactive IO and serialization of dynamically extensible generator objects.

Uhh.. Let's throw some use cases at you, there are an unlimited number;

- Generating events, worlds and enemies within games.
- Generating language reflecting the structure of grammar
- Generating Test Cases in an Automated testing program.
- Generating music and art with WebGL and Web Audio.
- Generating solutions in an evolutionary computation algorithm.
- Generating Whatever.. the list will grow!

---
### Basics

the fundamental unit is a G-node.

a G-node represents a generator object that can be resolved to produce objects.

G-nodes have 3 parts:

- Component: |   the compositional structure of what is generated.
- Form:      |   the processes applied at each stage and description of state.
- Context:   |   the items of state modified by and informing the aforementioned processes.

each part is represented by an object argument

an example G-node used to generate cats with eventual exhaustion of names could look like this.
```javascript
var gentyl = require("gentyl")
var G = gentyl.g

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
        return `a size ${obj.size} cat with ${obj.ferocity} ferocity called ${obj.name}`
    }
}).prepare();

g.resolve() // -> a size 34 cat with 10 ferocity called Tiger
g.resolve() // -> a size 34 cat with 10 ferocity called Magnus


```

> __note__: it is neccecary to call prepare() before resolve.

---

### Structure

G-nodes can contain other G-nodes. The recursive architecture means function parameters can be converted to dynamic generators at a whim, as seen with ferocity becoming an increasing function of 'intensity'. The functions can gain access to thier parent node's state using =+ (track parent) or  =_ (track root). Here 'intensity' is a root property that determines both size and ferocity.

```js
var gentyl = require("gentyl")
var G = gentyl.g

function Linear(obj){
    return obj.c + obj.m*this.intensity  //This A
}

function randIntRng(obj){
    return Math.floor(obj.min + Math.random()*(obj.max - obj.min))   
}

var g = G({
    size:G({m:2, c:10}, {f:Linear, m:"=+"}),
    ferocity:G({
            m:2,
            c:G({
                min:5,
                max:10,
            },{
                f:randIntRng
            })
        },{
            f:Linear,  //this A within
            m:"=_"
        }),
    name:G({},
        {
            f:function(obj, args){
                return this.names.pop() || "puss" // This B
            }
        },{
            names:["Ben", "Lucy", "Magnus","Tiger"]    //B refers to here
        })
    },{
        f:function(obj, args){
            this.intensity += 1; //This A
            return `a size ${obj.size} cat with ${obj.ferocity} ferocity called ${obj.name}`
        }
    },{
       intensity:0  //This A refers to here
}).prepare();

```
This G-Node will create cats like above with names like above but with sizes increasing in sequence (10, 12, 14..) and ferocity increasing but also with random influence, could be (6, 12, 9)

---

### Sharing State

Gentyl is caring about state, it doesn't marginalise it like other functional reactive technologies. We control state by localising it to each node and constructing a special object to call _this_. children are able to access and modify the parent state by explicitly saying they will. there are three access modes and three ways to designate the source.

#### Access Modes
- track (=) : the train tracks : meaning no modification only awareness of changes.
- share (&) : and we will work together : meaning you can modify the designated source.
- inherit (|) : or I am like but apart : meaning the parent state is prototype/superclass.

#### Designators
- parent (+) : up by one : designate the direct parent.
- root (_ ) : rock bottom : designate the root of the structure.
- arbitrary (\\x) : back up x stops : designate x steps up the parent chain.
