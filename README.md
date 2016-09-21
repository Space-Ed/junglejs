
# Gentyl  [![Build Status](https://travis-ci.org/Space-Ed/gentyl.png?branch=master)](https://travis-ci.org/Space-Ed/gentyl)
## What is Structural Synthesis and what is it for?

The purpose of this tool is to provide a means of synthesizing and channeling structured data using a hierarchical state system. The system supports reactive IO and serialization of its dynamic generator objects.

Let's throw around some use cases, there are an unlimited number.

##### Gentyl can generate:
- events, worlds and enemies within games.
- language reflecting the structure of grammar.  
- Test Cases in an Automated testing program.
- music and art with WebGL and Web Audio.
- solutions in an evolutionary computation algorithm.
- posts to appear in a feed.
- Whatever.. the list will grow!

##### Gentyl can also:
- Destructure
- Compose
- Store
- Stream processing
- Asynchonous input-output

**Gentyl is data focused**

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
var G = gentyl.G

var catGen = G({
    size:34,
    ferocity:10,
    name:G({},
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

catGen.resolve() // -> a size 34 cat with 10 ferocity called Tiger
catGen.resolve() // -> a size 34 cat with 10 ferocity called Magnus


```

> __note__: it is neccecary to call prepare() before resolve.

---

### Structure

G-nodes can contain other G-nodes. The recursive architecture means function parameters can be converted to dynamic generators at a whim, as seen with ferocity becoming an increasing function of 'intensity'. The functions can gain access to thier parent node's state using =+ (track parent) or  =_ (track root). Here 'intensity' is a root property that determines both size and ferocity.

```js
function Linear(obj){
    return obj.c + obj.m*this.intensity  //This A
}

function randIntRng(obj){
    return Math.floor(obj.min + Math.random()*(obj.max - obj.min))   
}

var NamePicker = G({},
    {
        f:function(obj, args){
            return this.names.pop() || "puss" // This B
        }
    },{
        names:["Ben", "Lucy", "Magnus","Tiger"]    //B refers to here
})

var catGen = G({
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
    name:NamePicker
    },{
        f:function(obj, args){
            this.intensity += 1; //This A
            return `a size ${obj.size} cat with ${obj.ferocity} ferocity called ${obj.name}`
        }
    },{
       intensity:0  //This A refers to here
}).prepare();

```
This G-Node will create cats like above with names like above but with sizes increasing in sequence (10, 12, 14..) and ferocity increasing but also with random influence, could be (6, 12, 9). Notice how easily nodes can be refactored the 'NamePicker' here can be used elsewhere without interfering with the state.

---

##Advanced
the following will outline the advanced features, explaining the concepts and components involved. For detailed examples please refer to the jasmine specs.

### Sharing State

Gentyl is caring about state, it doesn't marginalise it like other functional reactive technologies. State is controlled by localising it to each node and constructing a special _this_ object. Children are able to access and modify the parent state by explicitly saying they will, but not the other way around, thus the state dependency structure matches the containment structure. There are three access modes and three ways to designate the source.

#### State Construction Modes.

|Mode | Symbol | Mnemonic | Meaning|
|--------|:-:|-------------------|-----------------------|
|Track   | = | The train tracks             | No modification only awareness of changes.|
|Share   | & | And we will work together    | Child can modify the designated source.|
|Inherit | (pipe) | It's you or me          | The parent state is prototype/superclass.|

#### Designators

|type      | symbol | Mnemonic   | meaning                                |
|----------|:-:|-----------------|----------------------------------------|
|parent    | + | up by one       |  designate the direct parent.          |
|root      | _ | at the bottom   |  designate the root of the structure.  |
|arbitrary | x | back up x stops |  designate x steps up the parent chain.|

for example ' &+ ' means share parent, ' |_ '  means inherit from the root. ' =2 ' means track my parents parent. These can be combined but there are rules about conflicting names and not sharing.


----

### Functions(sort of)

Gentyl is founded on some guiding principles
- functions are always provided as a single letter property of the form object.
- functions always use this to refer to the state of thier host node.
- function arguments and return values represent specific stages in execution of the structure, thus are usually

|Function  | Symbol | arguments | returns | role  |
|----------|:-:|--|---|--|
|Preparator| p | 1:initialization arguments passed to prepare() and replicate() | void | works as a constructor for the state of the generator|
|Carrier   | c | 1: the argument passed from the parent or resolve() of the root| the argument passed to the components | appropriation, elaborating, preparation.|
|Selector  | s | 1: the argument returned from the carrier, 2:the full set of keys or indicies as array| the iterable with the indicies or keys of children that will resolve | filtering, execution, selective dispatch.|
|Resolver  | f | 1: The resolved component object, 2:the value passed to resolve this node| value passed back to the parent | composition, interpretation, filtering data.|

---

### Methods
|name | purpose|
|---|--|
|prepare(prepArgs)  | This method transforms the tree of unprepared g-node, creating parent links and constructing the state dependencies. It is a neccessary operation before resolve otherwise the functions would not be able to access the wider context.|
|resolve(resArgs) -> result   | Take the resolve args recursively working out to the leaf nodes through carrier and selector and back through the resolver. This is the fundamental generative action the running of the core algorithm.|
|replicate(prepArgs) -> G-Node | Produce a copy of the original node(called the ancestor), replicas have isolated state but share their form. The relationship between ancestor, replicate and the resultant gnode is  much like a prototype, new keyword and the instance. Therefore _G-Nodes are their own prototype_.|
|bundle()-> G-bundle | This action is a serialization of the G-node structure that can be converted to JSON and recovered later, so long as a means of recovering the functions within the form is provided(currently only recoverable within the required module instance). it is recoverable by calling R(G-bundle).|
|shell() -> SignalShell | This is the io mechanism of gentyl. A signal shell is an object with ins and outs: {ins:{label1:inpFunction1, label2:inpFunction2... }, outs:{label1:outputSignal1, label2:outputSignal2}}. calling the input function for a label calls functions that inject data into the system . The output signals can have callbacks attached to them, these will be called when the node with the corresponding output label is resolved.  |

### Replication

### Bundling and Reconstruction

### IO
