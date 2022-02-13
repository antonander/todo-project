import * as React from 'react'
import { Form, Button } from 'semantic-ui-react'
import Auth from '../auth/Auth'
import { getTodo, getUploadUrl, patchTodo, uploadFile } from '../api/todos-api'

enum UploadState {
  NoUpload,
  FetchingPresignedUrl,
  UploadingFile,
}

interface EditTodoProps {
  match: {
    params: {
      todoId: string
    }
  }
  auth: Auth
}

interface EditTodoState {
  file: any;
  todoName: string;
  changedName: string;
  todo: any;
  uploadState: UploadState
}

export class EditTodo extends React.PureComponent<
  EditTodoProps,
  EditTodoState
> {
  state: EditTodoState = {
    file: undefined,
    todoName: '',
    todo: undefined,
    changedName: '',
    uploadState: UploadState.NoUpload
  }

  async componentDidMount() {
    try {
      const todo = await getTodo(this.props.auth.getIdToken(), this.props.match.params.todoId)
      this.setState({
        changedName: todo.name,
        todo: {
          name: todo.name,
          dueDate: todo.dueDate,
          done: todo.done
        }
      })
    } catch (e:any) {
      alert(`Failed to fetch todo: ${e.message}`)
    }
  }

  handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    this.setState({
      file: files[0]
    })
  }

  handleTodoName = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('The name ', event.target.value)

    this.setState({
      changedName: event.target.value
    })
  }

  handleFileSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault()

    if(!this.state.file && this.state.todo.name === this.state.changedName){
      alert('Either choose a file or change the todo name')
      return
    }

    if (this.state.file) {
      try {
        // if (!this.state.file) {
        //   alert('File should be selected')
        //   return
        // }

        this.setUploadState(UploadState.FetchingPresignedUrl)
        const uploadUrl = await getUploadUrl(this.props.auth.getIdToken(), this.props.match.params.todoId)

        this.setUploadState(UploadState.UploadingFile)
        await uploadFile(uploadUrl, this.state.file)

        alert('File was uploaded!')
      } catch (e:any) {
        alert('Could not upload a file: ' + e.message)
      } finally {
        this.setUploadState(UploadState.NoUpload)
      }
    }

    if (this.state.todo.name !== this.state.changedName) {
      try {
        const newTodo = this.state.todo
        newTodo.name = this.state.changedName
        console.log('The new todo to set ', newTodo)


        await patchTodo(this.props.auth.getIdToken(), this.props.match.params.todoId, newTodo)

        alert('Name was changed!')
      } catch (e:any) {
        alert('Couldnt change name: ' + e.message)
      }
    }

  }

  setUploadState(uploadState: UploadState) {
    this.setState({
      uploadState
    })
  }

  render() {
    return (
      <div>
        <h1>Edit Todo</h1>

        <Form onSubmit={this.handleFileSubmit}>
        <Form.Field>
            <label>Name</label>
            <input
              type="text"
              placeholder={'Enter todo name here'}
              onChange={this.handleTodoName}
              value={this.state.changedName}
            />
          </Form.Field>

          <Form.Field>
            <label>File</label>
            <input
              type="file"
              accept="image/*"
              placeholder="Image to upload"
              onChange={this.handleFileChange}
            />
          </Form.Field>

          {this.renderButton()}
        </Form>
      </div>
    )
  }

  renderButton() {

    return (
      <div>
        {this.state.uploadState === UploadState.FetchingPresignedUrl && <p>Uploading image metadata</p>}
        {this.state.uploadState === UploadState.UploadingFile && <p>Uploading file</p>}
        <Button
          loading={this.state.uploadState !== UploadState.NoUpload}
          type="submit"
        >
          Submit
        </Button>
      </div>
    )
  }
}
