# BigMamasKitchen

<p align="center"><img src="images/bmk.png" alt="bmk logo" width="350"/></p>

## Introduction

Welcome to the Kitchen!! Big Mama is strong, bold, loves cute things (such as her cat, Katchup), and cultivates the most flavorful dishes for her consumers. After a few minutes in her kitchen your taste buds are sure to be left tingling. She will throw in a wide variety of flavors from spicy to sweet, from tangy to salty, and will always finish a job with a sassy wink. Better get your plates ready, are you ready for a taste?

This language is for people who love to cook as it uses cooking/baking phrases. BigMamasKitchen serves to spice up statically typed/scoped languages.

Cooked up by Bridget O'Connor, Sophia Mackin, Moriah Scott, Rachel Nguyen, Miliano Mikol.

## Features

- Statically typed with static scoping

- Data Structures like arrays and dictionaries

- Cooking keywords

- Emoji brackets and comments

- Simple statements terminated with ;)

- Cinnamon Roll Arrays (@)

- Square Waffle Dictionaries [#]

## Types:

| BigMamasKitchen | JavaScript |
| --------------- | ---------- |
| spicy           | Boolean    |
| bitter          | Number     |
| salty           | String     |

## Keywords Guide

| BigMamasKitchen | JavaScript      |
| --------------- | --------------- |
| cooked          | true            |
| raw             | false           |
| (^-^)~ ~(^-^)   | {}              |
| ;)              | ;               |
| until condition | (condition)     |
| ingredient      | let             |
| recipe          | func            |
| bland           | void            |
| stop            | break           |
| stir            | while           |
| bake            | for             |
| addAPinchOf     | if              |
| orSubstitute    | else if         |
| dumpLeftovers   | else            |
| mamaSays        | console.log("") |
| null            | empty           |

**Note: After each statement please add the ;)**

## Function Declaration

```
recipe eggsBenedict (bitter eggWhites, sweet sauce) (^-^)~ ~(^-^)
```

## Variable Declaration and Assignment

### Declaration

```
ingredient bitter egg = 1 ;)
```

## Assignment

```
egg = 4 ;)
```

```
Array:

ingredient salty(@) rollCake= (@)"strawberry", "sugar", "cake"(@) ;)

Dictionary:

ingredient spicy[#] ramen = [#] "MEAT" : [#] "Beef": 1[#] ,
"VEGGIES" : [#] "Broccolli": 3[#] [#] ;)


```

## Control Flow

### If Statement

```
addAPinchOf i < -35 (^-^)~

~(^-^) orSubstitute i > 35 (^-^) ~

~(^-^) dumpLeftovers (^-^)~

~(^-^)
```

### While Loop

```
stir until cooked (^-^)~
~(^-^)

```

### For Loops

```
bake ingredient bitter egg = 1 until egg < 40 egg++ (^-^)~ ~(^-^)
```

## Comments

### Multi-line Comment:

```
--[=] Include more sugar [=]--
```

### Single-line Comment:

```
  ~(=^..^) We love Big Mama
```

## Example Programs

### Hello, World!

<table>
  <tr>
  <th>BigMamasKitchen</th>
  <th>JavaScript</th>
  </tr>

  <tr>
  <td>

```
mamaSays "Hello world!" ;)
```

  </td>
  <td>

```JavaScript
console.log(“Hello world!”);
```

  </td>
  </tr>
</table>

### Sum of Two Numbers

<table>
  <tr>
  <th>BigMamasKitchen</th>
  <th>JavaScript</th>
  </tr>

  <tr>
  <td>

```
recipe bitter Add (bitter a, bitter b) (^-^)~
  serve a + b ;)
~(^-^)
```

</td>
  <td>

```JavaScript
function Add (a, b) {
 return a + b;
 }
```

  </td>
  </tr>
</table>

## Even or Odd

<table>
  <tr>
  <th>BigMamasKitchen</th>
  <th>JavaScript</th>
  </tr>

  <tr>
  <td>

```
recipe spicy evenOdd (bitter a) (^-^)~
  serve x % 2 == 0 ;)
~(^-^)

```

</td>
  <td>

```JavaScript
function evenOdd (a) {
    return a % 2 == 0;
}

```

  </td>
  </tr>
</table>

### Greatest Common Divisor

<table>
  <tr>
  <th>BigMamasKitchen</th>
  <th>JavaScript</th>
  </tr>

  <tr>
  <td>

```
recipe bitter gcd (bitter a, bitter b) (^-^)~
  addAPinchOf a < 0 (^-^)~
    a = -1 * a ;)
  ~(^-^)

  addAPinchOf (b < 0) (^-^)~
    b = -1 * b ;)
  ~(^-^)

  addAPinchOf b > a (^-^)~
    ingredient bitter temp = a ;) 
    a = b ;) 
    b = temp ;)
  ~(^-^)

  stir until cooked (^-^)~

    addAPinchOf b == 0 (^-^)~
      serve a ;)
    ~(^-^)

    a = a % b ;)

    addAPinchOf a == 0 (^-^)~
      serve b ;)
    ~(^-^)

    b = b % a ;)
  ~(^-^)
~(^-^)

```

</td>
  <td>

```JavaScript
function gcd(a,b) {
    a = Math.abs(a);
    b = Math.abs(b);
    if (b > a) {var temp = a; a = b; b = temp;}
    while (true) {
        if (b == 0) return a;
        a %= b;
        if (a == 0) return b;
        b %= a;
    }
}


```

  </td>
  </tr>
</table>

## Other Examples

<table>
  <tr>
  <th>BigMamasKitchen</th>
  <th>JavaScript</th>
  </tr>

  <tr>
  <td>

```
addAPinchOf i < -35 (^-^)~
  mamaSays “too cold” ;)
~(^-^) Orsubstitute i > 35 (^-^) ~
  mamaSays “just right” ;)
~(^-^) dumpLeftovers (^-^)~
  mamaSays “try again!” ;)
~(^-^)
```

</td>
  <td>

```JavaScript
if (i < -35) {
console.log(“too cold”);
} else if (i > 35) {
console.log(“just right”);
} else {
console.log(“try again!”);
}

```

  </td>
  </tr>
</table>

<table>
  <tr>
  <th>BigMamasKitchen</th>
  <th>JavaScript</th>
  </tr>

  <tr>
  <td>

```
ingredient bitter temperature = 0 ;)
stir until cooked (^-^)~
  temperature++ ;)
  addAPinchOf temperature == 360 (^-^)~
    stop ;)
  (^-^)~
(^-^)~
```

</td>
  <td>

```JavaScript

let temperature = 0
while (true) {
temperature++
if(temperature == 360){
break;
}
}

```

  </td>
  </tr>
</table>

