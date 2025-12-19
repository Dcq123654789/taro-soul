class Timer extends React.Component {
  state = { count: 0 };
  intervalId = null;

  componentDidMount() {
    this.intervalId = setInterval(() => {
      this.setState((prev) => ({ count: prev.count + 1 }));
    }, 1000);
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.count !== prevState.count) {
      console.log("Count changed:", this.state.count);
    }
    if (this.state.count === 10) {
      clearInterval(this.intervalId);
    }
  }

  componentWillUnmount() {
    clearInterval(this.intervalId);
  }

  render() {
    return <div>Count: {this.state.count}</div>;
  }
}

function Timer1() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setCount((prev) => prev + 1), 1000);
    return () => clearInterval(id);
  }, []); // 空数组 => 只在挂载/卸载时执行
  useEffect(() => {
    if (count === 10) {
      clearInterval(id);
    }
    console.log("Count changed:", count);
  }, [count]); // 依赖 count => 类似 componentDidUpdate(count)

  return <div>Count: {count}</div>;
}
