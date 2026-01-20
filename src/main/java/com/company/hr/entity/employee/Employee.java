package com.company.hr.entity.employee;

import com.company.hr.entity.auth.UserAccount;
import jakarta.persistence.*;

import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "employees")
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", unique = true)
    private UserAccount userAccount;

    @Column(nullable = false, length = 200)
    private String fullName;

    @Column(length = 120)
    private String position;

    @Column(length = 120)
    private String department;

    @Column(length = 50)
    private String phone;

    @Column(length = 255)
    private String address;

    private LocalDate dateOfBirth;
    private LocalDate joinDate;

    @Column(length = 500)
    private String profilePhotoPath;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    @Column(nullable = false)
    private Instant updatedAt = Instant.now();

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }

    protected Employee() {
    }

    public Employee(UserAccount userAccount, String fullName, String position, String department) {
        this.userAccount = userAccount;
        this.fullName = fullName;
        this.position = position;
        this.department = department;
    }

    public Long getId() {
        return id;
    }

    public UserAccount getUserAccount() {
        return userAccount;
    }

    public String getFullName() {
        return fullName;
    }

    public String getPosition() {
        return position;
    }

    public String getDepartment() {
        return department;
    }

    public String getPhone() {
        return phone;
    }

    public String getAddress() {
        return address;
    }

    public LocalDate getDateOfBirth() {
        return dateOfBirth;
    }

    public LocalDate getJoinDate() {
        return joinDate;
    }

    public String getProfilePhotoPath() {
        return profilePhotoPath;
    }

    public void setProfilePhotoPath(String profilePhotoPath) {
        this.profilePhotoPath = profilePhotoPath;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void updateProfile(String fullName, String position, String department, String phone, String address, LocalDate dateOfBirth, LocalDate joinDate) {
        this.fullName = fullName;
        this.position = position;
        this.department = department;
        this.phone = phone;
        this.address = address;
        this.dateOfBirth = dateOfBirth;
        this.joinDate = joinDate;
    }
}

