# 리액트 훅 깊게 살펴보기
## 리액트의 모든 훅 파헤치기
### useState
> 함수 컴포넌트 내부에서 상태를 정의하고 이 상태를 관리할 수 있게 해주는 훅.
```
const [state, setState] = useState(initialState);
```

#### 내부 살펴보기
useState의 내부를 살펴본다면 실제는 useReducer와 클로저 개념을 사용해서 구현 한 것을 알 수 있다.  
매번 실행되는 함수 컴포넌트 환경에서 state값을 유지하고 사용하기 위해 클로저를 활용하여 useState와 관련된 정보를 저장해두고 이를 필요할 때마다 꺼내놓는 형식.   


#### [게으른 초기화](https://legacy.reactjs.org/docs/hooks-reference.html#lazy-initial-state)
- useState에서 기본값으로 변수 대신 특정한 함수를 인수로 넣어주는 것.  
- useState의 초깃값이 복잡하거나 ```무거운 연산```을 포함하고 있을 때 사용을 추천.   
  ( 해당 함수는 state가 처음 만들어질 때만 사용되기 때문. => 리렌더링을 무시 )

```
// 바로 값 집어넣기
const [count, setCount] = useState(Number.parseInt(window.localStorage.getItem(cacaheKey)))

// 게으른 초기화 해주기
const [count, setCount] = useState(()=>Number.parseInt(window.localStorage.getItem(cacaheKey)))
```
   <br/>
   <br/>


### useEffect
> 렌더링마다 의존성의 값을 보며 의존성의 값이 이전과 다른게 있을 경우 부수 효과를 실행하는 함수.   
> 실행할 부수 효과가 포함된 함수(with 클린업 함수), 의존성 배열로 구성.
```
useEffect(()=>{
  // something
},[props,state])
```
#### 클린업 함수
- 이벤트를 등록하고 지울 때 사용해야하는 함수.
- 새로운 값과 함께 렌더링 된 뒤에 실행된다. but 이전 state를 참조해 실행된다. 
```
useEffect(()=>{
  function addMouseEvent(){
    console.log(counter)
  }
  window.addEventListener('click',addMouseEvent);

  return ()=>{
    console.log('클린업 함수 실행!'),counter)
    window.removeEventListener('click',addMouseEvent)
  }
},[counter])
```

리렌더링 실행시 콘솔에 찍히는 동작
```
클린업 함수 실행! 0
1

클린업 함수 실행! 1
2

클린업 함수 실행! 2
3

클린업 함수 실행! 3
4

```


```
nnnnn
'클린업 함수 실행! 0
nnnnn
```
   
_위의 코드를 실행했는데 콘솔창에는 이렇게 세개가 뜨게된다면 당신은 React.StrictMode를 사용하고 있다는 것이다.    
나는 이걸 안끄고 해서 15분 넘게 공식문서와 책을 뒤졌다._

> 위의 실행 순서를 보면 우리는 왜 클린업 함수에서 이벤트를 지워야하는지 알 수 있다.   
> 콜백이 실행될 때 마다 이전의 클린업 함수가 이전에 등록했던 이벤트 핸들러를 삭제해주기 때문에 추가해주는 것이다.
> 따라서 unmount 개념으로 보기보다는 함수 컴포넌트가 리렌더링 됐을 때 의존성 변화가 있었을 당시 이전 값을 기준으로 실행되는
> 청소부 개념으로 봐야한다.   

#### 의존성 배열 
- 빈배열을 넣어줄 경우 최초 렌더링 직후에 실행된 다음부터는 실행되지 않는다.
- 아무런 값이 없을 경우 의존성을 비교할 필요 없이 렌더링 마다 실행된다. ( 렌더링 확인용으로 사용됨 )

##### useEffect 대신 일반 함수 실행문으로 돌려도 괜찮을까?
어차피 렌더링 마다 실행된다면 useEffect없이 돌려도 되지 않을까 싶지만 아래 코드를 봐보자.
```
  console.log(1)
  useEffect(() => {
    console.log(2);
  }, [counter]);
  console.log(3)

// 위 코드의 콘솔이 찍힌 순서는 1, 3, 2 이다. 
```
- useEffect는 클라이언트 실행을 보장해준다. ( 서버 사이드 렌더링 관점에서 필요 )
- useEffect는 렌더링이 완료된 이후에 실행된다. 하지만 위와 같이 밖에 적은 코드는 렌더링 도중에 실행되고
  이런 작업들이 지연될 경우 함수 컴포넌트의 반환을 지연시키게 된다. => 렌더링에 악형향을 미칠 수 있다.

_따라서 useEffect는 컴포넌트가 렌더링 된 이후에 어떠한 부수효과를 일으키고 싶을 때 사용된다는 것을 인지하자._


##### 의존성 배열의 비교
의존성 배열의 비교는 Object.is를 기반으로 하는 얕은 비교를 수행한다.   
따라서 깊이가 있는 객체를 의존성 배열에 넣는다면 비교가 예상과 다르게 동작할 수 있다.
<br/>  
<br/>
<br/>

#### useEffect를 사용할 때 주의할 점
- eslint-disable-line react-hooks/exhaustive-deps 주석 자제하기 ( 무한루프 조심하기 )
- useEffect의 첫 번째 인수에 함수명을 부여하라 ( 목적을 파악하기 쉽게 하기 )
  ```
  useEffect(function counting(){
    setCount(prev=>prev+1)
  },[count])
  ```
- 거대한 useEffect 만들지 말기 ( 여러개의 useEffect로 나누기 )
- 불필요한 외부함수 만들지 않기 ( 외부에서 가져올거면 내부에서 선언해서 사용해주자. )

### useMemo
> 비용이 큰 연산에 대한 큰 결과를 저장하고 저장된 값을 반환하는 훅.   
> 첫 번째 인수로 생성하는 함수, 두 번째 인수로 의존성 배열을 전달.   
> 의존성 배열의 인자가 변경되지 않는 한 다시 계산되지 않는다.   
> 단순한 값 뿐만 아니라 컴포넌트도 감싸는 것이 가능.   
```
const memoizedValue = useMemo(()=>expensiveComputation(a,b),[a,b])  
```

<br/>
<br/>

### useCallback
> useMemo와 기억해주는 훅이지만 값이 아닌 콜백 자체를 기억한다.  
> 필요없게 느껴질 수 있지만 memo로 감싼 컴포넌트가 상위의 컴포넌트 재렌더링으로 함수재생성이 되어  
> 예측하지 않은 렌더링이 일어나는 것을 방지해준다.
```
const toggle = useCallback(function toggle1(){
  setStatus(!status1) 
},[])
```

#### 그래서 뭘 써야해?
useMemo는 값을 메모하는 용도이기 때문에 함수 선언문으로 반환해야 한다.  
이는 코드를 작성할 때 혼란을 불러 일으킬 수 있기 때문에 좀 더 간단한 useCallback을 사용하자.  
무엇을 사용하든 역할은 동일하다.

<br/>
<br/>

### useRef
> 컴포넌트 내부에서 렌더링이 일어나도 변경 가능한 상태 값을 저장한다.

#### useRef만의 특징
- 반환값이 객체 내부에 있는 current로 값에 접근 또는 변경할 수 있다.
- 값이 변해도 렌더링 시켜주지 않는다.  

<br/>
<br/>

### useContext

#### Context란?
> prop drilling을 간소화 해주기 위해 등장한 개념  
> 명시적인 props 전달 없이도 선언한 하위 컴포넌트 모두에서 자유롭게 원하는 값을 사용이 가능하다. 

```
<Context.Provider value={{hello:'react'}}>
  <Context.Provider value={{hello:'js'}}>
    <ChildrenComponent/>
  </Context.Provider>
</Context.Provider>
```
- 같은 이름이라면 가장 가까운 Provider의 값을 가져오게 된다.

#### 주의할 점
- Provider에 의존성이 묶여있으므로 컴포넌트의 재활용이 어려워진다. 
- 컴포넌트 트리가 복잡해질수록 더 많은 컨텍스트로 둘러싸이게 되고 리소스가 낭비되게 된다.  

#### useContext는 상태관리 API가 아니다.
- 어떠한 상태를 기반으로 다른 상태를 만들어낼 수 없다.
- 필요에 따라 이런 상태 변화를 최적화할 수 없다.

<br/>
<br/>
<br/>


### useReducer
> useState의 심화버전으로 사전에 정의된 dispatcher로만 state를 수정할 수 있게 만들어준 훅이다.
> state 업데이트를 미리 정의해둔 dispatcher로만 제한하는 것. == 시나리오를 제한적으로 두고 변경을 빠르게 확인한다.

#### 반환값
- state
  - useReducer가 가지고 있는 값을 의미한다.
  - useState처럼 배열을 반환하며 동일하게 첫번째 요소가 이 값이다.
- dispatcher
  - state를 업데이트 하는 함수.
  - setState는 값을, dispatcher는 action을 넘겨준다.   
 
#### 인수
- reducer
  - 기본 action을 정의하는 함수.
- initialState
  - useReducer의 초깃값.
- init
  - 게으른 초기화를 위한 함수이다. ( 이 값이 존재하면 initialState를 인수로 init함수 실행 )

```
const memoizedValue = useMemo(()=>expensiveComputation(a,b),[a,b])  
```

<br/>
<br/>
<br/>

### useImperativeHandle
> 부모에게서 넘겨받은 ref를 원하는 대로 수정할 수 있는 훅.   
> ref 자체에만 액세스해야 하는 경우에는 굳이 useImperativeHandle 훅을 사용할 필요가 없다.  
> 해당 훅은 ref를 통해 하위 구성 요소의 특정 메서드나 속성에 액세스할 때 사용되곤 하는데 이또한 리액트가 지향하는 바에 따르면   
> 사용하지 않는 것이 좋다. props로 처리가 가능하다면 props와 state로 처리해주자.   
> forwardRef 또한 props로 ref를 내려줄 때 네이밍을 ref로 하지 않으면 사용하지 않아도 된다.
<br/>
<br/>
<br/>


### useLayoutEffect
> useEffect와 동일하나, 모든 DOM의 변경 후에 동기적으로 발생한다.
> 여기서 DOM의 변경은 렌더링을 의미한다. => 브라우저에 실제로 해당 변경 사항이 반영되는 시점이 아님.

#### 실행순서
1. 리액트가 DOM 업데이트
2. useLayoutEffect 실행
3. 브라우저에 변경 사항을 반영
4. useEffect를 실행

브라우저에 반영되기 전에 작업이 되기 때문에 사용자 경험을 늘릴 수 있지만   
useLayoutEffect가 계산이 된 후에야 브라우저에 변경사항이 반영되기 때문에 꼭 필요한 작업이 아니면 넣지 않도록 주의하자.  

<br/>
<br/>
<br/>

### 훅의 규칙
1. 최상위에서만 훅을 호출해야 한다. 반복문, 조건문, 중첩함수 내에서 훅 실행 불가.   
   이는 컴포넌트 렌더링시 항상 동일한 순서로 훅이 호출되는 것을 보장하기 위함이다.
2. 훅을 호출할 수 있는 것은 리액트 함수 컴포넌트 혹은 사용자 정의 훅의 두 가지 경우 뿐이다.   
   자바스크립트 함수 내에서는 훅 사용 불가.
   
  
<br/>
<br/>
<br/>
<br/>

## 사용자 정의 훅과 고차 컴포넌트 중 무엇을 써야 할까?
### 사용자 정의 훅
> 리액트에서만 사용할 수 있는 기법으로 이름을 반드시 use로 시작한다는 규칙이 있다.
> 내부적으로 리액트에서 사용하는 훅을 쓸 수 있으며 훅의 규칙또한 따라야 한다.

### 고차 컴포넌트
> 컴포넌트 자체의 로직을 재사용하기 위한 방법으로 고차함수의 일종이기 때문에 리액트가 아니더라도 자바스크립트 환경에서 널리 쓰일 수 있다.

#### 주의할 점
- 이름을 작성할 때 with를 써줘야 한다. ( 강제 아님 )
- 부수 효과를 최소화 해야한다. ( 인수로 받은 컴포넌트를 수정, 추가, 삭제하지 않아야 한다. )


### 사용자 정의 훅 vs 고차 컴포넌트
#### 사용자 정의 훅이 필요한 경우
- 리액트에서 제공하는 훅으로만 공통 로직을 격리할 수 있을 때.


#### 고차 컴포넌트를 사용해야 하는 경우
- 함수 컴포넌트의 반환값, 렌더링 결과물에도 영향을 미치는 공통 로직이라면 고차 컴포넌트를 사용하자.
