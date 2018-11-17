import React from 'react';

import NewFolderModal from './NewFolderModal';
import { ReactComponent as FolderNoteIcon } from '../../images/icons/foldernote.svg';
import { ReactComponent as AddIcon } from '../../images/icons/add.svg';
import { ReactComponent as NoteIcon } from '../../images/icons/note.svg';

class IntroFolders extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			modalIsOpen: false,
		};
	}

	toggleModal = () => {
		this.setState((prevState) => ({
			modalIsOpen: !prevState.modalIsOpen,
		}));
	};

	render() {
		return (
			<div className="intro-folder">
				<FolderNoteIcon className="logo" />

				<div className="panel">
					<p>
						<NoteIcon className="note-icon" />
						<span className="text-highlight">
							Notes, highlights, tags and folders
						</span>{' '}
						make it easy to organize, focus and recall the most interesting
						content you discover on Winds.
					</p>

					<ul>
						<li>Tag articles and podcast episodes</li>
						<li>Organize feeds in folders</li>
						<li>Add notes and highlights</li>
					</ul>

					<div className="btn-new" onClick={this.toggleModal}>
						<AddIcon />
						New Folder
					</div>
				</div>

				<NewFolderModal
					isOpen={this.state.modalIsOpen}
					toggleModal={this.toggleModal}
				/>
			</div>
		);
	}
}

export default IntroFolders;
