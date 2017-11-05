// TODO: page: 144

class App extends React.Component {
  state = {
    timers: [],
  };
  render() {
    return (
      <div className='ui three column centered grid'>
        <div className='column'>
          <EditableTimerList
            timers={this.state.timers}
            onFormSubmit={this.onFormSubmit}
            removeTimer={this.onRemoveTimer}
            onToggleStart={this.onToggleStart}
          />
          <ToggleableTimerForm
            isOpen={false}
            onFormSubmit={this.onFormSubmit}
          />
        </div>
      </div>
    );
  }
  componentDidMount() {
    this.loadTimersFromServer();
    setInterval(this.loadTimersFromServer, 5000);
  }
  loadTimersFromServer = () => {
    client.getTimers(timers => {
      this.setState({ timers });
    });
  }
  onFormSubmit = (timer) => {
    if(typeof timer.id == 'undefined') {
      const t = helpers.newTimer(timer);
      this.setState({
        timers: this.state.timers.concat(t)
      });
    } else {
      this.setState({
        timers: this.state.timers.map(t => {
          if(t.id === timer.id) {
            return Object.assign({}, t, {
              title: timer.title,
              project: timer.project
            });
          }
          return t;
        })
      });
    }
  }
  onRemoveTimer = (timerId) => {
    /* let newTimers = [];
    for(let i=0; i<this.state.timers.length; i++) {
      if(this.state.timers[i].id !== timerId) {
        newTimers.push(Object.assign({}, this.state.timers[i]));
      }
    }
    this.setState({ timers: newTimers }); */

    // easier using filter
    this.setState({
      timers: this.state.timers.filter(t => t.id !== timerId)
    });
  }
  onToggleStart = (timerId) => {
    console.log(`timer with id ${timerId} has been toggled`);
    this.setState({
      timers: this.state.timers.map(t => {
        if(t.id === timerId) {
          let wasRunning = t.runningSince ? true : false;
          let elapsed = t.elapsed;
          if(wasRunning) {
            elapsed = t.elapsed + Date.now() - t.runningSince;
          }
          return Object.assign({}, t, {
            elapsed,
            runningSince: t.runningSince ? null : Date.now()
          });
        }
        return t;
      })
    });
  }
}

class EditableTimerList extends React.Component {
  render() {
    return (
      <div id='timers'>
        {this.props.timers.map(timer => (
          <EditableTimer
            id={timer.id}
            key={timer.id}
            title={timer.title}
            project={timer.project}
            elapsed={timer.elapsed}
            runningSince={timer.runningSince}
            onFormSubmit={this.props.onFormSubmit}
            removeTimer={this.props.removeTimer}
            onToggleStart={this.props.onToggleStart}
          />
        ))}
      </div>
    );
  }
}

class EditableTimer extends React.Component {
  state = {
    editFormOpen: false
  };

  render() {
    if (this.state.editFormOpen) {
      return (
        <TimerForm
          id={this.props.id}
          title={this.props.title}
          project={this.props.project}
          onFormCancel={this.handleCancel}
          onFormSubmit={this.handleSubmit}
        />
      );
    }
    return (
      <Timer
        id={this.props.id}
        title={this.props.title}
        project={this.props.project}
        elapsed = {this.props.elapsed}
        runningSince = {this.props.runningSince}
        editTimer={this.editTimer}
        removeTimer={this.removeTimer}
        onToggleStart={this.props.onToggleStart}
      />
    );
  }
  handleCancel = () => {
    this.setState({editFormOpen: false});
  }
  handleSubmit = (timer) => {
    this.props.onFormSubmit({
      id: this.props.id,
      title: timer.title,
      project: timer.project
    });
    this.setState({editFormOpen: false});
  }
  editTimer = () => {
    this.setState({editFormOpen: true});
  }
  removeTimer = () => {
    this.props.removeTimer(this.props.id);
  }
}

class TimerForm extends React.Component {
  state = {
    title: this.props.title || '',
    project: this.props.project || ''
  };
  render() {
    const submitText = this.props.id ? 'Update' : 'Create';
    return (
      <div className='ui centered card'>
        <div className='content'>
          <div className='ui form'>
            <div className='field'>
              <label>Title</label>
              <input
                type='text'
                value={this.state.title}
                onChange={this.handleTitleChange}
              />
            </div>
            <div className='field'>
              <label>Project</label>
              <input
                type='text'
                value={this.state.project}
                onChange={this.handleProjectChange}
              />
            </div>
            <div className='ui two bottom attached buttons'>
              <button
                className='ui basic blue button'
                onClick={this.handleSubmit}
              >{submitText}</button>
              <button
                className='ui basic red button'
                onClick={this.props.onFormCancel}
              >Cancel</button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  handleTitleChange = (e) => {
    this.setState({
      title: e.target.value
    });
  }
  handleProjectChange = (e) => {
    this.setState({
      project: e.target.value
    });
  }
  handleSubmit = () => {
    this.props.onFormSubmit({
      id: this.props.id,
      title: this.state.title,
      project: this.state.project
    });
  }
}

class ToggleableTimerForm extends React.Component {
  state = {
    isOpen: false
  };
  
  render() {
    if(this.state.isOpen) {
      return (
        <TimerForm
          onFormCancel={this.toggleOpen}
          onFormSubmit={this.handleFormSubmit}
        />
      );
    }
    return (
      <div className='ui basic content center aligned segment'>
        <button
          className='ui basic button icon'
          onClick={this.toggleOpen}
        >
          <i className='plus icon' />
        </button>
      </div>
    );
  }

  toggleOpen = () => {
    this.setState({
      isOpen: !this.state.isOpen
    })
  }

  handleFormSubmit = (newTimerValues) => {
    this.props.onFormSubmit(newTimerValues);
    this.toggleOpen();
  }
}

class Timer extends React.Component {
  render() {
    const elapsedString = helpers.renderElapsedString(this.props.elapsed, this.props.runningSince);
    const mainLabel = this.props.runningSince ? 'Stop' : 'Start';
    const btnClass = this.props.runningSince ? 'red' : 'blue';
    return (
      <div className='ui centered card'>
        <div className='content'>
          <div className='header'>
            {this.props.title}
          </div>
          <div className='meta'>
            {this.props.project}
          </div>
          <div className='center aligned description'>
            <h2>
              {elapsedString}
            </h2>
          </div>
          <div className='extra content'>
            <span
              className='right floated edit icon'
              onClick={this.props.editTimer}
            >
              <i className='edit icon' />
            </span>
            <span
              className='right floated trash icon'
              onClick={this.props.removeTimer}
            >
              <i className='trash icon' />
            </span>
          </div>
        </div>
        <div
          className={`ui bottom attached ${btnClass} basic button`}
          onClick={this.onToggleStart}
        >
          {mainLabel}
        </div>
      </div>
    );
  }
  componentDidMount() {
    this.forceUpdateInterval = setInterval(() => this.forceUpdate(), 50);
  }
  componentWillUnmount() {
    clearInterval(this.forceUpdateInterval);
  }
  onToggleStart = () => {
    this.props.onToggleStart(this.props.id);
  }
}

ReactDOM.render(<App />, document.getElementById('content'));