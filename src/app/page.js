'use client';

import react, { useState, useEffect } from "react";
import axios from "axios";
import * as Yup from "yup";
import { Formik, Field, ErrorMessage, Form } from "formik";
import DataTable from "react-data-table-component";
import dayjs from "dayjs";
//import styles from "./page.module.css";

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

  

  // Load data
  useEffect(() => {
    // Issues
    axios.get("https://localhost:44329/Issue")
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
        <button onClick={() => resolveIssue(row)}>Resolve issue</button>
      ),
    }
  ];

  if(isClient){
    return (
      <div>
        <h1>NEW ISSUE</h1>
  
        <Formik
          initialValues={issue}
          validationSchema={issueSchema}
          enableReinitialize={true}
          onSubmit={(values, actions) => {
            saveIssue(values, actions);
          }}>
          {({ values, errors, touched, handleChange, handleBlur, handleSubmit }) => (
            <Form>
              <div>
                <Field type="text" name="title" placeholder="Title" />
                <ErrorMessage name="title" component="div" />
              </div>
              <div>
                <Field type="text" name="descriptionIssue" placeholder="Description" />
                <ErrorMessage name="descriptionIssue" component="div" />
              </div>
              <div>
                <Field as="select" name="idPriorityIssue" placeholder="Priority" >
                  <option value="">Select priority</option>
                  {
                    priorities.map((priorityItem) => (
                      <option key={priorityItem.idPriorityIssue} value={priorityItem.idPriorityIssue}>
                        {priorityItem.descriptionPriority}
                      </option>
                    ))
                  }
                </Field>
                <ErrorMessage name="idPriorityIssue" component="div" />
              </div>
              <div>
                <button type="submit">Enviar</button>
              </div>
            </Form>
          )}
        </Formik>
  
        <h1>ISSUES</h1>
        <DataTable
          columns={columns}
          data={issues}
          pagination
        />
      </div>
    );
  }

  return (
    <div>Loading...</div>
  );
}
