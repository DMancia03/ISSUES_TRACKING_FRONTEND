'use client';

import react, { useState, useEffect } from "react";
import axios from "axios";
import * as Yup from "yup";
import { Formik, Field, ErrorMessage, Form } from "formik";
import DataTable from "react-data-table-component";
import dayjs from "dayjs";
import styles from "./custom.css";

const issueSchema = Yup.object({
  title: Yup.string().required("Title is required").max(100, "Title cannot exceed 100 characters"),
  descriptionIssue: Yup.string().required("Description is required").max(500, "Description cannot exceed 500 characters"),
  idPriorityIssue: Yup.number().required("Priority is required").min(1, "Invalid priority"),
});

export default function Home() {
  // Lists
  const [issues, setIssues] = useState([]);
  const [status, setStatus] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [reload, setReload] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [filterStatus, setFilterStatus] = useState(0);

  const [issue, setIssue] = useState({
    title: "",
    descriptionIssue: "",
    idPriorityIssue: 0,
  });

  // Save
  const saveIssue = async (values, actions) => {
    console.log("Saving issue:", values);
    const issueJson = JSON.stringify(values);

    try{

      await axios.post(
        "https://localhost:44329/Issue", 
        issueJson,
        {
          headers: { 'Content-Type': 'application/json' }
        }
      ).then((response) => {
        console.log("Issue saved successfully", response.data);
        setReload(!reload);
        actions.resetForm();
      }).catch((error) => {
        console.error("There was an error saving the issue!", error);
      });

    }catch(error){
      console.error("There was an error saving the issue!", error);
    }
  }

  // Resolve issue
  const resolveIssue = async (row) => {
    console.log("Resolving issue:", row);
  
    try{
  
      await axios.put(
        "https://localhost:44329/Issue/" + row.idIssue,
      ).then((response) => {
        console.log("Issue saved successfully", response.data);
        setReload(!reload);
      }).catch((error) => {
        console.error("There was an error saving the issue!", error);
      });
  
    }catch(error){
      console.error("There was an error saving the issue!", error);
    }
  }

  const filterOpenIssues = () => {
    setFilterStatus(1);
    setReload(!reload);
  };

  const filterResolvedIssues = () => {
    setFilterStatus(2);
    setReload(!reload);
  };

  const removeFilterIssues = () => {
    setFilterStatus(0);
    setReload(!reload);
  };

  // Load data
  useEffect(() => {
    var urlGetIssues = "https://localhost:44329/Issue";

    if(filterStatus == 1){
      urlGetIssues = "https://localhost:44329/Issue/open";
    }else if(filterStatus == 2){
      urlGetIssues = "https://localhost:44329/Issue/resolved"
    }

    // Issues
    axios.get(urlGetIssues)
      .then(response => {
        console.log(response.data);
        setIssues(response.data);
      })
      .catch(error => {
        console.error("There was an error fetching the issues!", error);
      });

    // Status
    axios.get("https://localhost:44329/StatusIssue")
      .then(response => {
        console.log(response.data);
        setStatus(response.data);
      })
      .catch(error => {
        console.error("There was an error fetching the issues!", error);
      });

    // Priorities
    axios.get("https://localhost:44329/PriorityIssue")
      .then(response => {
        console.log(response.data);
        setPriorities(response.data);
      })
      .catch(error => {
        console.error("There was an error fetching the issues!", error);
      });

    //
    setIsClient(true);

  }, [reload]);

  // Columns for datatable
  const columns = [
    {
      name: 'ID',
      selector: row => row.idIssue,
      sortable: true,
    },
    {
      name: 'Title',
      selector: row => row.title,
      sortable: false,
    },
    {
      name: 'Description',
      selector: row => row.descriptionIssue,
      sortable: false,
    },
    {
      name: 'Status',
      selector: row => row.statusIssue,
      sortable: true,
    },
    {
      name: 'Priority',
      selector: row => row.priorityIssue,
      sortable: true,
    },
    {
      name: 'Created Date',
      selector: (row) => (dayjs(row.createDate).format('YYYY/MM/DD HH:mm')),
    },
    {
      name: 'Resolve Date',
      selector: (row) => (row.resolveDate != null ? dayjs(row.resolveDate).format('YYYY/MM/DD HH:mm') : 'Unresolved'),
    },
    {
      name: 'Actions',
      cell: (row) => (
        (row.statusIssue.toLowerCase() !== 'resolved') ? ( <button onClick={() => resolveIssue(row)} className="btn-resolved">Resolve issue</button> ) : (<p></p>)
      ),
    }
  ];

  if(isClient){
    return (
      <div>
        <Formik
          initialValues={issue}
          validationSchema={issueSchema}
          enableReinitialize={true}
          onSubmit={(values, actions) => {
            saveIssue(values, actions);
          }}>
          {() => (
            <div className="form-container">
              <h1>NEW ISSUE?</h1>
              <Form className="form">
                <div className="input-container">
                  <label htmlFor="title">Title: *</label>
                  <Field type="text" name="title" placeholder="Title" className="input-form" />
                  <ErrorMessage name="title" component="div" className="error-form" />
                </div>
                <div className="input-container">
                  <label htmlFor="descriptionIssue">Description: *</label>
                  <Field type="text" name="descriptionIssue" placeholder="Description" className="input-form" />
                  <ErrorMessage name="descriptionIssue" component="div" className="error-form" />
                </div>
                <div className="input-container">
                  <label htmlFor="idPriorityIssue">Priority: *</label>
                  <Field as="select" name="idPriorityIssue" placeholder="Priority" className="input-form" >
                    <option value="">Select priority</option>
                    {
                      priorities.map((priorityItem) => (
                        <option key={priorityItem.idPriorityIssue} value={priorityItem.idPriorityIssue}>
                          {priorityItem.descriptionPriority}
                        </option>
                      ))
                    }
                  </Field>
                  <ErrorMessage name="idPriorityIssue" component="div" className="error-form" />
                </div>
                <div className="btn-container">
                  <button type="submit" className="btn-submit">Submit issue</button>
                </div>
              </Form>
            </div>
          )}
        </Formik>
  
        <div className="table-container">
          <h1>ISSUES LIST</h1>
          <button onClick={filterOpenIssues} className="btn-open">Show only open</button>
          <button onClick={filterResolvedIssues} className="btn-resolved">Show only resolved</button>
          { filterStatus != 0 && <button onClick={removeFilterIssues} className="btn-all">Show all</button>}
          <DataTable
            columns={columns}
            data={issues}
            pagination
          />
        </div>
      </div>
    );
  }

  return (
    <div>Loading...</div>
  );
}
